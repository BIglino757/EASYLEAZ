"""
Iteration 11: Document upload + download flow (admin)
Bug fix verification: GET /api/leads/{leadId}/documents/{docId}/download
must accept Bearer admin auth and return the PDF binary.
"""
import io
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://easyleaz-elite.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@easyleaz.ch"
ADMIN_PASSWORD = "easyleaz2024"

# A small but valid PDF byte content
SAMPLE_PDF = (
    b"%PDF-1.4\n"
    b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
    b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 100 100]>>endobj\n"
    b"xref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000099 00000 n \n"
    b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n150\n%%EOF\n"
)


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} - {r.text}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token, f"No token in login response: {data}"
    return token


@pytest.fixture(scope="module")
def created_lead(admin_token):
    """Create a lead with 1 identity_document + 1 salary_slip"""
    files = [
        ("identity_document", ("TEST_id.pdf", io.BytesIO(SAMPLE_PDF), "application/pdf")),
        ("salary_slips", ("TEST_slip1.pdf", io.BytesIO(SAMPLE_PDF), "application/pdf")),
    ]
    data = {
        "first_name": "TEST_Jean",
        "last_name": "TEST_Dupont",
        "phone": "+41791234567",
        "email": "TEST_jdupont@example.com",
        "desired_vehicle": "TEST Vehicle",
    }
    r = requests.post(f"{API}/leads", data=data, files=files, timeout=20)
    assert r.status_code == 200, f"Create lead failed: {r.status_code} - {r.text}"
    body = r.json()
    assert body.get("success") is True
    lead_id = body.get("lead_id") or body.get("id")
    assert lead_id, f"No lead_id in response: {body}"

    # Fetch lead details with admin auth
    detail = requests.get(f"{API}/leads/{lead_id}", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert detail.status_code == 200, f"Get lead failed: {detail.status_code} - {detail.text}"
    lead = detail.json()
    assert len(lead.get("documents", [])) == 2, f"Expected 2 docs, got {lead.get('documents')}"
    yield {"id": lead_id, "documents": lead["documents"]}

    # teardown
    requests.delete(f"{API}/leads/{lead_id}", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)


class TestDocumentDownload:
    def test_create_lead_with_documents(self, created_lead):
        assert created_lead["id"]
        docs = created_lead["documents"]
        types = sorted([d["type"] for d in docs])
        assert types == ["identity", "salary"], f"Doc types: {types}"
        for d in docs:
            assert "id" in d
            assert "original_name" in d
            assert d["original_name"].startswith("TEST_")

    def test_download_without_auth_returns_401(self, created_lead):
        doc = created_lead["documents"][0]
        r = requests.get(f"{API}/leads/{created_lead['id']}/documents/{doc['id']}/download", timeout=15)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    def test_download_with_admin_auth_returns_200_and_binary(self, created_lead, admin_token):
        for doc in created_lead["documents"]:
            r = requests.get(
                f"{API}/leads/{created_lead['id']}/documents/{doc['id']}/download",
                headers={"Authorization": f"Bearer {admin_token}"},
                timeout=15,
            )
            assert r.status_code == 200, f"Doc {doc['id']} download failed: {r.status_code} - {r.text[:200]}"
            # binary check
            assert r.content.startswith(b"%PDF"), f"Content not a PDF: {r.content[:20]}"
            assert len(r.content) == len(SAMPLE_PDF), f"Length mismatch: {len(r.content)} vs {len(SAMPLE_PDF)}"
            # filename in Content-Disposition
            cd = r.headers.get("content-disposition", "")
            assert "TEST_" in cd, f"Content-Disposition missing TEST_ filename: {cd}"

    def test_download_with_invalid_token_returns_401(self, created_lead):
        doc = created_lead["documents"][0]
        r = requests.get(
            f"{API}/leads/{created_lead['id']}/documents/{doc['id']}/download",
            headers={"Authorization": "Bearer invalid_token_xyz"},
            timeout=15,
        )
        assert r.status_code == 401, f"Expected 401 for bad token, got {r.status_code}"
