"""
Iteration 12 backend tests — Mongo binary persistence for:
- EasyLeaz vehicle images (POST /api/vehicles/{id}/images + GET /api/uploads/vehicles/{filename})
- EasyLoc vehicle images (POST /api/easyloc/admin/vehicles/{id}/images + GET /api/easyloc/uploads/{filename})
- Lead documents (POST /api/leads + GET /api/leads/{id}/documents/{doc_id}/download)

For each case we test the disk-wipe fallback: after upload, delete the local file
from disk and verify the GET still returns 200 with the binary content (served from Mongo).
"""
import io
import os
import uuid
from pathlib import Path

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@easyleaz.ch"
ADMIN_PASSWORD = "easyleaz2024"

UPLOAD_VEH = Path("/app/backend/uploads/vehicles")
EL_UPLOAD = Path("/app/backend/easyloc_uploads/vehicles")
LEAD_UPLOAD = Path("/app/backend/uploads")

# Minimal valid JPEG (1x1 white) — accepted by validate_file (.jpg) and Content-Type image/jpeg
JPEG_1x1 = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n"
    b"\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a"
    b"\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08"
    b"\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01"
    b"\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04"
    b"\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02"
    b"\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05"
    b"\x12!1A\x06\x13Qa\x07\"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0"
    b"$3br\x82\t\n\x16\x17\x18\x19\x1a%&'()*456789:CDEFGHIJSTUVWXYZcdefghi"
    b"jstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98"
    b"\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7"
    b"\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6"
    b"\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3"
    b"\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfb"
    b"\xd0\xff\xd9"
)

SAMPLE_PDF = (
    b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
    b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 100 100]>>endobj\n"
    b"xref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000099 00000 n \n"
    b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n150\n%%EOF\n"
)


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} - {r.text}"
    token = r.json().get("token") or r.json().get("access_token")
    assert token
    return token


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ─── EasyLeaz vehicle images ───
class TestEasyLeazVehicleImageMongoPersist:
    @pytest.fixture(scope="class")
    def vehicle_id(self, admin_headers):
        payload = {
            "brand": "TEST_Brand",
            "model": "TEST_Iter12",
            "year": 2025,
            "mileage": 0,
            "fuel": "essence",
            "transmission": "automatique",
            "price": 30000,
            "monthly_payment": 500,
            "condition": "new",
        }
        r = requests.post(f"{API}/vehicles", json=payload, headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        vid = r.json()["id"]
        yield vid
        requests.delete(f"{API}/vehicles/{vid}", headers=admin_headers, timeout=15)

    def test_upload_then_serve_from_mongo_after_disk_wipe(self, vehicle_id, admin_headers):
        files = [("files", (f"TEST_{uuid.uuid4().hex[:6]}.jpg", io.BytesIO(JPEG_1x1), "image/jpeg"))]
        r = requests.post(f"{API}/vehicles/{vehicle_id}/images", files=files, headers=admin_headers, timeout=30)
        assert r.status_code == 200, f"Upload failed: {r.status_code} - {r.text}"
        body = r.json()
        assert body.get("images"), "No images in vehicle response"
        filename = body["images"][-1]["filename"]

        # GET first while disk file exists
        url = f"{API}/uploads/vehicles/{filename}"
        r1 = requests.get(url, timeout=15)
        assert r1.status_code == 200
        assert r1.headers["content-type"].startswith("image/")
        assert len(r1.content) == len(JPEG_1x1)

        # Wipe disk file → verify still served via Mongo fallback
        disk_path = UPLOAD_VEH / filename
        if disk_path.exists():
            disk_path.unlink()
        assert not disk_path.exists()

        r2 = requests.get(url, timeout=15)
        assert r2.status_code == 200, f"Mongo fallback failed: {r2.status_code} - {r2.text[:200]}"
        assert r2.headers["content-type"].startswith("image/")
        assert len(r2.content) == len(JPEG_1x1)


# ─── EasyLoc vehicle images ───
class TestEasyLocVehicleImageMongoPersist:
    EL_VEH_ID = "cdc4ef1f-2797-45ac-87fb-44ba1c69dac9"  # seeded A35

    def test_upload_then_serve_from_mongo_after_disk_wipe(self, admin_headers):
        files = [("files", (f"TEST_{uuid.uuid4().hex[:6]}.jpg", io.BytesIO(JPEG_1x1), "image/jpeg"))]
        r = requests.post(
            f"{API}/easyloc/admin/vehicles/{self.EL_VEH_ID}/images",
            files=files,
            headers=admin_headers,
            timeout=30,
        )
        assert r.status_code == 200, f"EL upload failed: {r.status_code} - {r.text}"
        body = r.json()
        imgs = body.get("images", [])
        assert imgs, "No images on EL vehicle"
        # last appended is ours
        last_url = imgs[-1]
        assert last_url.startswith("/api/easyloc/uploads/")
        filename = last_url.rsplit("/", 1)[-1]

        get_url = f"{BASE_URL}{last_url}"
        r1 = requests.get(get_url, timeout=15)
        assert r1.status_code == 200
        assert len(r1.content) == len(JPEG_1x1)

        disk_path = EL_UPLOAD / filename
        if disk_path.exists():
            disk_path.unlink()
        assert not disk_path.exists()

        r2 = requests.get(get_url, timeout=15)
        assert r2.status_code == 200, f"EL Mongo fallback failed: {r2.status_code} - {r2.text[:200]}"
        assert r2.headers["content-type"].startswith("image/")
        assert len(r2.content) == len(JPEG_1x1)

        # Cleanup — remove the test image from the EL vehicle
        requests.delete(
            f"{API}/easyloc/admin/vehicles/{self.EL_VEH_ID}/images",
            params={"image_url": last_url},
            headers=admin_headers,
            timeout=15,
        )


# ─── Lead documents (Mongo persistence) ───
class TestLeadDocumentMongoPersist:
    @pytest.fixture(scope="class")
    def lead(self, admin_headers):
        files = [
            ("identity_document", ("TEST_id.pdf", io.BytesIO(SAMPLE_PDF), "application/pdf")),
            ("salary_slips", ("TEST_slip1.pdf", io.BytesIO(SAMPLE_PDF), "application/pdf")),
        ]
        data = {
            "first_name": "TEST_Iter12",
            "last_name": "MongoPersist",
            "phone": "+41791234567",
            "email": f"TEST_iter12_{uuid.uuid4().hex[:6]}@example.com",
            "desired_vehicle": "TEST",
        }
        r = requests.post(f"{API}/leads", data=data, files=files, timeout=20)
        assert r.status_code == 200, r.text
        lead_id = r.json().get("lead_id") or r.json().get("id")
        det = requests.get(f"{API}/leads/{lead_id}", headers=admin_headers, timeout=15)
        assert det.status_code == 200
        lead = det.json()
        yield lead
        requests.delete(f"{API}/leads/{lead_id}", headers=admin_headers, timeout=15)

    def test_download_doc_after_disk_wipe_uses_mongo(self, lead, admin_headers):
        for doc in lead["documents"]:
            # Disk-wipe path (filename is uuid+ext, located under /app/backend/uploads/)
            fname = doc.get("filename")
            if fname:
                fp = LEAD_UPLOAD / fname
                if fp.exists():
                    fp.unlink()
                assert not fp.exists()

            url = f"{API}/leads/{lead['id']}/documents/{doc['id']}/download"
            r = requests.get(url, headers=admin_headers, timeout=15)
            assert r.status_code == 200, f"Mongo fallback dl failed: {r.status_code} - {r.text[:200]}"
            assert r.content.startswith(b"%PDF")
            assert len(r.content) == len(SAMPLE_PDF)
