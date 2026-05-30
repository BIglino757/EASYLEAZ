"""
Iteration 10 backend tests:
- new field `address_since_date` (type=month) persisted on lead creation
- field returned by GET /api/leads/{id}
- CSV header at position 9 (1-indexed) = "À cette adresse depuis"
- CSV row contains the value at that position for the created lead
"""
import os
import io
import csv
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_EMAIL = "admin@easyleaz.ch"
ADMIN_PASSWORD = "easyleaz2024"

_state = {}


@pytest.fixture(scope="module")
def auth_headers():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    token = r.json().get("token")
    assert token
    return {"Authorization": f"Bearer {token}"}


class TestAddressSinceDate:
    """Verify new field address_since_date is persisted via multipart POST /api/leads."""

    def test_create_lead_with_address_since_date(self):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "first_name": f"TEST_{unique}",
            "last_name": "Iter10",
            "phone": "+41791234567",
            "email": f"test_iter10_{unique}@example.ch",
            "marital_status": "Marié(e)",
            "nationality": "Suisse",
            "birth_date": "1990-05-15",
            "address": "Rue de l'Adresse 10, 1201 Genève",
            "address_since_date": "2020-09",
            "residence_permit": "C",
            "children_count": "2",
            "children_ages": "5, 8",
            "housing_cost": "2200",
            "housing_status": "Locataire",
            "employment_date": "2018-09",
            "monthly_income": "9500",
            "professional_status": "Salarié",
            "desired_vehicle": "Test Vehicle Iter10",
        }
        files = {
            "identity_document": ("id.pdf", b"%PDF-1.4\n%dummy id\n", "application/pdf"),
            "salary_slips": ("slip.pdf", b"%PDF-1.4\n%dummy salary\n", "application/pdf"),
        }
        r = requests.post(f"{BASE_URL}/api/leads", data=payload, files=files, timeout=30)
        assert r.status_code == 200, f"Lead create failed: {r.status_code} {r.text}"
        body = r.json()
        assert body.get("success") is True
        assert body.get("id")
        _state["lead_id"] = body["id"]
        _state["payload"] = payload

    def test_get_lead_returns_address_since_date(self, auth_headers):
        lead_id = _state.get("lead_id")
        assert lead_id
        r = requests.get(f"{BASE_URL}/api/leads/{lead_id}", headers=auth_headers, timeout=10)
        assert r.status_code == 200, r.text
        lead = r.json()
        assert lead.get("address_since_date") == "2020-09", (
            f"Expected address_since_date=2020-09, got '{lead.get('address_since_date')}'"
        )


class TestCSVColumnPosition:
    """The CSV header 'À cette adresse depuis' must be at position 9 (1-indexed), between Adresse and Permis séjour."""

    def test_csv_header_position_and_value(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/leads/export", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        content = r.content.decode("utf-8-sig", errors="replace")
        rows = list(csv.reader(io.StringIO(content), delimiter=";"))
        assert len(rows) >= 2, "CSV must have header + at least 1 row"
        header = rows[0]
        # Position 9 = index 8
        assert len(header) > 8, f"Header too short: {header}"
        assert header[8] == "À cette adresse depuis", (
            f"Position 9 should be 'À cette adresse depuis', got '{header[8]}'. Full header: {header}"
        )
        # Adjacent context: 'Adresse' must be at idx 7 and 'Permis séjour' at idx 9
        assert header[7] == "Adresse", f"Position 8 should be 'Adresse', got '{header[7]}'"
        assert header[9] == "Permis séjour", f"Position 10 should be 'Permis séjour', got '{header[9]}'"

        # Locate our just-created lead and check value
        p = _state.get("payload")
        assert p, "No payload from previous test"
        email_idx = header.index("Email")
        row = next((r for r in rows[1:] if r[email_idx] == p["email"]), None)
        assert row is not None, f"Created lead with email {p['email']} not found in CSV"
        assert row[8] == "2020-09", f"Expected '2020-09' at position 9, got '{row[8]}'"


class TestCleanup:
    def test_cleanup(self, auth_headers):
        lid = _state.get("lead_id")
        if lid:
            requests.delete(f"{BASE_URL}/api/leads/{lid}", headers=auth_headers, timeout=10)
