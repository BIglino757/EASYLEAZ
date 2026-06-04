"""
Iteration 14 backend tests:
- POST /api/leads with docs + GET download with Bearer (200 + non-empty binary)
- Same download without Bearer => 401
- unavailable-dates includes both 'approved' and 'confirmed' reservations
- Verify EasyLoc vehicles list has at least 1 vehicle and gallery info available
"""
import os
import io
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://easyleaz-elite.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@easyleaz.ch"
ADMIN_PASSWORD = "easyleaz2024"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token, f"no token in {data}"
    return token


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _tiny_pdf_bytes():
    # Minimal-ish PDF header — backend just stores binary
    return b"%PDF-1.4\n%TEST iter14\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


# ============== EasyLeaz Lead doc download ==============

class TestLeadDocDownload:
    @pytest.fixture(scope="class")
    def created_lead_id(self):
        files = {
            "identity_document": ("TEST_id.pdf", io.BytesIO(_tiny_pdf_bytes()), "application/pdf"),
        }
        files_list = [
            ("identity_document", ("TEST_id.pdf", _tiny_pdf_bytes(), "application/pdf")),
            ("salary_slips", ("TEST_pay1.pdf", _tiny_pdf_bytes(), "application/pdf")),
            ("salary_slips", ("TEST_pay2.pdf", _tiny_pdf_bytes(), "application/pdf")),
            ("salary_slips", ("TEST_pay3.pdf", _tiny_pdf_bytes(), "application/pdf")),
        ]
        data = {
            "first_name": "TEST_Iter14",
            "last_name": "DownloadTest",
            "phone": "+41790000000",
            "email": "test_iter14@example.com",
            "monthly_income": "8000",
            "professional_status": "Salarié",
            "desired_vehicle": "Mercedes A35",
            "marital_status": "Célibataire",
            "nationality": "Suisse",
            "birth_date": "1990-01-01",
            "address": "Rue Test 1, 1000 Lausanne",
            "address_since_date": "2020-01",
            "residence_permit": "Citoyen suisse",
            "children_count": "0",
            "children_ages": "",
            "housing_cost": "1500",
            "housing_status": "Locataire",
            "employment_date": "2020-01",
        }
        r = requests.post(f"{API}/leads", data=data, files=files_list, timeout=30)
        assert r.status_code in (200, 201), f"POST /api/leads failed: {r.status_code} {r.text[:500]}"
        body = r.json()
        lead_id = body.get("id") or body.get("lead", {}).get("id")
        assert lead_id, f"no lead id in {body}"
        return lead_id

    def test_lead_created_with_documents(self, created_lead_id, auth_headers):
        r = requests.get(f"{API}/leads/{created_lead_id}", headers=auth_headers, timeout=15)
        assert r.status_code == 200, f"GET lead failed: {r.status_code} {r.text[:300]}"
        lead = r.json()
        docs = lead.get("documents") or []
        assert len(docs) >= 4, f"expected >=4 docs, got {len(docs)}: {docs}"

    def test_download_without_bearer_is_401(self, created_lead_id, auth_headers):
        # Get a doc id first
        r = requests.get(f"{API}/leads/{created_lead_id}", headers=auth_headers, timeout=15)
        docs = r.json().get("documents") or []
        assert docs, "no documents on lead"
        doc_id = docs[0].get("id") or docs[0].get("doc_id") or docs[0].get("filename")
        assert doc_id

        # No bearer
        r2 = requests.get(f"{API}/leads/{created_lead_id}/documents/{doc_id}/download", timeout=15)
        assert r2.status_code in (401, 403), f"expected 401/403 without auth, got {r2.status_code}"

    def test_download_with_bearer_returns_binary(self, created_lead_id, auth_headers):
        r = requests.get(f"{API}/leads/{created_lead_id}", headers=auth_headers, timeout=15)
        docs = r.json().get("documents") or []
        assert docs
        doc_id = docs[0].get("id") or docs[0].get("doc_id") or docs[0].get("filename")

        r2 = requests.get(
            f"{API}/leads/{created_lead_id}/documents/{doc_id}/download",
            headers=auth_headers,
            timeout=20,
        )
        assert r2.status_code == 200, f"expected 200, got {r2.status_code} {r2.text[:200]}"
        assert len(r2.content) > 0, "empty binary"
        # Should start with %PDF since we uploaded a pdf
        assert r2.content.startswith(b"%PDF") or len(r2.content) > 10


# ============== EasyLoc unavailable-dates with confirmed status ==============

class TestUnavailableDatesConfirmed:
    def test_unavailable_dates_includes_confirmed(self, auth_headers):
        # 1) List vehicles
        rv = requests.get(f"{API}/easyloc/vehicles", timeout=15)
        assert rv.status_code == 200, rv.text[:300]
        vehicles = rv.json()
        assert isinstance(vehicles, list) and len(vehicles) > 0, "no easyloc vehicles seeded"
        vehicle_id = vehicles[0]["id"]

        # 2) Create a reservation far in the future (2027) to avoid collisions
        date_debut = "2027-08-10"
        date_fin = "2027-08-15"
        payload = {
            "nom": "TEST_iter14",
            "prenom": "Confirmed",
            "email": "iter14_confirmed@test.com",
            "telephone": "+41790000001",
            "date_debut": date_debut,
            "date_fin": date_fin,
            "vehicle_id": vehicle_id,
            "vehicule": vehicles[0].get("name", "A35"),
            "message": "TEST iter14 confirmed flow",
        }
        rr = requests.post(f"{API}/easyloc/reservations", json=payload, timeout=15)
        assert rr.status_code in (200, 201), f"reservation failed {rr.status_code} {rr.text[:300]}"
        resa = rr.json()
        resa_id = resa.get("id") or resa.get("reservation", {}).get("id")
        assert resa_id, f"no reservation id in {resa}"

        # 3) PUT admin status -> confirmed
        ru = requests.put(
            f"{API}/easyloc/admin/reservations/{resa_id}",
            json={"status": "confirmed"},
            headers=auth_headers,
            timeout=15,
        )
        assert ru.status_code in (200, 204), f"PUT status failed {ru.status_code} {ru.text[:300]}"

        # 4) GET unavailable-dates and check the range appears
        rd = requests.get(f"{API}/easyloc/vehicles/{vehicle_id}/unavailable-dates", timeout=15)
        assert rd.status_code == 200, rd.text[:300]
        body = rd.json()
        dates = body if isinstance(body, list) else body.get("dates", [])
        # Backend may return strings YYYY-MM-DD
        joined = " ".join(str(d) for d in dates)
        assert "2027-08-10" in joined, f"2027-08-10 missing from unavailable-dates after confirmed: {dates[:20]}..."
        assert "2027-08-14" in joined or "2027-08-15" in joined, f"end of range missing: {dates[:20]}..."


# ============== EasyLoc vehicles for gallery testing ==============

class TestEasyLocVehiclesGallery:
    def test_vehicles_have_images_field(self):
        r = requests.get(f"{API}/easyloc/vehicles", timeout=15)
        assert r.status_code == 200
        vehicles = r.json()
        assert len(vehicles) > 0
        v = vehicles[0]
        # Either images array or image string
        has_imgs = bool(v.get("images")) or bool(v.get("image"))
        assert has_imgs, f"first vehicle has no image data: {v}"
        # Just info — log how many images the first vehicle has
        n = len(v.get("images") or ([] if not v.get("image") else [v.get("image")]))
        print(f"[iter14] first easyloc vehicle '{v.get('name')}' has {n} images")
