"""
Iteration 9 - End-to-end backend validation for EasyLeaz + EasyLoc.
Covers:
  - Vehicle descriptions (EasyLeaz catalogue + EasyLoc)
  - Lead creation with ALL new form fields (multipart)
  - Admin login + retrieval of created lead
  - CSV export contains new headers + values
  - EasyLoc unavailable-dates endpoint (approved reservations blocked)
"""
import os
import io
import csv
import uuid
import requests
import pytest
from datetime import date, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://easyleaz-elite.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@easyleaz.ch"
ADMIN_PASSWORD = "easyleaz2024"

# Holder for shared state between tests
_state = {}


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                      timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("success") is True
    assert data.get("token")
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ─── 1. Vehicle descriptions ───
class TestVehicleDescriptions:
    def test_easyleaz_occasion_vehicles_have_description(self):
        r = requests.get(f"{BASE_URL}/api/vehicles?condition=occasion", timeout=10)
        assert r.status_code == 200
        vehicles = r.json()
        assert isinstance(vehicles, list)
        assert len(vehicles) > 0, "Expected at least 1 occasion vehicle"
        def _label(v):
            return f"{v.get('brand', '')} {v.get('model', '')}".strip() or v.get("name", "")
        golf = next((v for v in vehicles if "Golf" in _label(v) or "8R" in _label(v) or "8 R" in _label(v)), None)
        assert golf is not None, f"Golf 8R not found in: {[_label(v) for v in vehicles]}"
        desc = golf.get("description", "")
        assert desc and len(desc.strip()) > 10, f"Golf description empty/short: '{desc}'"
        _state["golf_name"] = _label(golf)
        _state["golf_id"] = golf.get("id")

    def test_easyloc_vehicles_have_description(self):
        r = requests.get(f"{BASE_URL}/api/easyloc/vehicles", timeout=10)
        assert r.status_code == 200
        vehicles = r.json()
        assert isinstance(vehicles, list) and len(vehicles) > 0
        v = vehicles[0]
        desc = v.get("description", "")
        assert desc and len(desc.strip()) > 10, f"EasyLoc vehicle description empty: '{desc}'"
        _state["el_vehicle_id"] = v.get("id")
        _state["el_vehicle_name"] = v.get("name")


# ─── 2. Lead creation with all new fields ───
class TestLeadCreationAllFields:
    def test_create_lead_multipart_with_new_fields(self):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "first_name": f"TEST_{unique}",
            "last_name": "Iter9",
            "phone": "+41791234567",
            "email": f"test_iter9_{unique}@example.ch",
            "marital_status": "Marié(e)",
            "nationality": "Suisse",
            "birth_date": "1990-05-15",
            "address": "Rue de Test 42, 1201 Genève",
            "residence_permit": "C",
            "children_count": "2",
            "children_ages": "5, 8",
            "housing_cost": "2200",
            "housing_status": "Locataire",
            "employment_date": "2018-09",
            "monthly_income": "9500",
            "professional_status": "Employé(e)",
            "desired_vehicle": _state.get("golf_name", "Volkswagen Golf 8 R 4MOTION"),
        }
        # add dummy PDF files
        files = {
            "identity_document": ("id.pdf", b"%PDF-1.4\n%dummy id\n", "application/pdf"),
            "salary_slips": ("slip.pdf", b"%PDF-1.4\n%dummy salary\n", "application/pdf"),
        }
        r = requests.post(f"{BASE_URL}/api/leads", data=payload, files=files, timeout=30)
        assert r.status_code == 200, f"Lead creation failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("success") is True
        assert data.get("id")
        _state["lead_id"] = data["id"]
        _state["lead_payload"] = payload

    def test_lead_persisted_with_all_fields(self, auth_headers):
        lead_id = _state.get("lead_id")
        assert lead_id, "No lead_id from previous test"
        r = requests.get(f"{BASE_URL}/api/leads/{lead_id}", headers=auth_headers, timeout=10)
        assert r.status_code == 200, f"Get lead failed: {r.text}"
        lead = r.json()
        p = _state["lead_payload"]
        # Verify each new/critical field is stored exactly
        for key in ["address", "children_count", "children_ages", "housing_status",
                    "employment_date", "monthly_income", "first_name", "last_name", "email"]:
            assert lead.get(key) == p[key], f"Mismatch for '{key}': got '{lead.get(key)}' expected '{p[key]}'"


# ─── 3. CSV export ───
class TestCSVExport:
    def test_csv_export_headers_and_values(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/leads/export", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        content = r.content.decode("utf-8-sig", errors="replace")
        reader = csv.reader(io.StringIO(content), delimiter=";")
        rows = list(reader)
        assert len(rows) >= 2, "CSV should have header + at least 1 row"
        header = rows[0]
        required_headers = [
            "Adresse", "Nombre d'enfants", "Âge des enfants",
            "Situation logement", "Date d'embauche", "Revenus mensuels bruts",
        ]
        missing = [h for h in required_headers if h not in header]
        assert not missing, f"Missing CSV headers: {missing}. Got: {header}"

        # Find our lead by email
        p = _state["lead_payload"]
        email_idx = header.index("Email")
        addr_idx = header.index("Adresse")
        kids_idx = header.index("Nombre d'enfants")
        ages_idx = header.index("Âge des enfants")
        housing_idx = header.index("Situation logement")
        emp_idx = header.index("Date d'embauche")
        income_idx = header.index("Revenus mensuels bruts")
        row = next((r for r in rows[1:] if r[email_idx] == p["email"]), None)
        assert row is not None, f"Created lead with email {p['email']} not found in CSV"
        assert row[addr_idx] == p["address"]
        assert row[kids_idx] == p["children_count"]
        assert row[ages_idx] == p["children_ages"]
        assert row[housing_idx] == p["housing_status"]
        assert row[emp_idx] == p["employment_date"]
        assert row[income_idx] == p["monthly_income"]


# ─── 4. EasyLoc unavailable-dates ───
class TestEasyLocUnavailableDates:
    def test_unavailable_dates_endpoint_returns_list(self):
        vid = _state.get("el_vehicle_id")
        assert vid
        r = requests.get(f"{BASE_URL}/api/easyloc/vehicles/{vid}/unavailable-dates", timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, list)
        _state["initial_blocked"] = set(body)

    def test_create_and_approve_reservation_blocks_dates(self, auth_headers):
        vid = _state.get("el_vehicle_id")
        # future dates 60-62 days out to avoid clash
        d0 = date.today() + timedelta(days=60)
        d1 = d0 + timedelta(days=2)
        resa_payload = {
            "vehicle_id": vid,
            "vehicule": _state.get("el_vehicle_name", "Vehicle"),
            "nom": "TEST_Iter9",
            "prenom": "Auto",
            "email": f"test_resa_{uuid.uuid4().hex[:6]}@example.ch",
            "telephone": "+41791234567",
            "date_debut": d0.isoformat(),
            "date_fin": d1.isoformat(),
            "message": "Test reservation for date-blocking",
        }
        r = requests.post(f"{BASE_URL}/api/easyloc/reservations", json=resa_payload, timeout=10)
        assert r.status_code == 200, f"Reservation create failed: {r.text}"
        resa_id = r.json().get("id")
        assert resa_id
        # Approve via admin endpoint (PUT /admin/reservations/{id})
        rp = requests.put(
            f"{BASE_URL}/api/easyloc/admin/reservations/{resa_id}",
            json={"status": "approved"},
            headers=auth_headers,
            timeout=10,
        )
        assert rp.status_code == 200, f"Approve failed: {rp.status_code} {rp.text}"

        # Re-fetch unavailable
        r2 = requests.get(f"{BASE_URL}/api/easyloc/vehicles/{vid}/unavailable-dates", timeout=10)
        assert r2.status_code == 200
        blocked = set(r2.json())
        expected = {d0.isoformat(), (d0 + timedelta(days=1)).isoformat(), d1.isoformat()}
        missing = expected - blocked
        assert not missing, f"Approved dates not blocked. Missing: {missing}. Blocked: {sorted(blocked)}"
        _state["test_resa_id"] = resa_id


# ─── 5. Cleanup ───
class TestCleanup:
    def test_cleanup(self, auth_headers):
        # Delete created lead
        lid = _state.get("lead_id")
        if lid:
            requests.delete(f"{BASE_URL}/api/leads/{lid}", headers=auth_headers, timeout=10)
        # Delete created reservation
        rid = _state.get("test_resa_id")
        if rid:
            # delete reservation via admin (if such endpoint exists)
            requests.delete(f"{BASE_URL}/api/easyloc/admin/reservations/{rid}", headers=auth_headers, timeout=10)
