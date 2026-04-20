"""
EasyLoc + EasyLeaz non-regression backend tests
- EasyLoc public routes (/api/easyloc/content, /vehicles, /reservations)
- EasyLoc admin routes protected by unified EasyLeaz JWT
- EasyLeaz non-regression (/api/vehicles, /api/cms, /api/leads, /api/auth/login)
"""
import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback from frontend .env (required)
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"
EL_API = f"{BASE_URL}/api/easyloc"

ADMIN_EMAIL = "admin@easyleaz.ch"
ADMIN_PASSWORD = "easyleaz2024"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def admin_token(s):
    # Make sure admin user is seeded
    try:
        s.post(f"{API}/auth/seed", timeout=10)
    except Exception:
        pass
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token, f"No token in login response: {data}"
    return token


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ========= EasyLoc PUBLIC =========
class TestEasyLocPublic:
    def test_get_content_all_sections(self, s):
        r = s.get(f"{EL_API}/content", timeout=10)
        assert r.status_code == 200
        data = r.json()
        for sec in ["hero", "process", "reservation_cta", "appointment", "contact",
                    "reservation_form", "navbar", "footer"]:
            assert sec in data, f"Missing section: {sec}"

    def test_get_vehicles_seed(self, s):
        r = s.get(f"{EL_API}/vehicles", timeout=10)
        assert r.status_code == 200
        vehicles = r.json()
        assert isinstance(vehicles, list)
        assert len(vehicles) >= 9, f"Expected >=9 vehicles, got {len(vehicles)}"
        names = [v.get("name") for v in vehicles]
        assert any("Mercedes-AMG GT" in n for n in names)
        assert any("Porsche 911" in n for n in names)

    def test_get_single_vehicle(self, s):
        all_v = s.get(f"{EL_API}/vehicles").json()
        vid = all_v[0]["id"]
        r = s.get(f"{EL_API}/vehicles/{vid}", timeout=10)
        assert r.status_code == 200
        assert r.json()["id"] == vid
        assert "_id" not in r.json()

    def test_get_vehicle_404(self, s):
        r = s.get(f"{EL_API}/vehicles/nonexistent-id", timeout=10)
        assert r.status_code == 404

    def test_create_reservation(self, s):
        payload = {
            "nom": "TEST_Dupont",
            "prenom": "Jean",
            "telephone": "0789898989",
            "email": "test_easyloc@example.com",
            "vehicule": "Mercedes-AMG GT",
            "date_debut": "2026-02-01",
            "date_fin": "2026-02-05",
            "message": "pytest reservation"
        }
        r = s.post(f"{EL_API}/reservations", json=payload, timeout=15)
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        data = r.json()
        assert "id" in data
        assert data.get("status") == "pending"


# ========= EasyLoc ADMIN (JWT protected) =========
class TestEasyLocAdminAuth:
    def test_admin_reservations_without_token(self, s):
        r = requests.get(f"{EL_API}/admin/reservations", timeout=10)
        assert r.status_code in (401, 403), f"Expected 401/403 got {r.status_code}"

    def test_admin_vehicles_post_without_token(self, s):
        r = requests.post(f"{EL_API}/admin/vehicles", json={"name": "x", "year": 2024, "image": "x", "price_day": 100, "price_weekend": 200}, timeout=10)
        assert r.status_code in (401, 403)

    def test_admin_reservations_with_token(self, auth_headers):
        r = requests.get(f"{EL_API}/admin/reservations", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


class TestEasyLocAdminVehicleCRUD:
    created_id = None

    def test_create_vehicle(self, auth_headers):
        payload = {
            "name": f"TEST_Vehicle_{uuid.uuid4().hex[:6]}",
            "year": 2025,
            "image": "https://example.com/img.jpg",
            "price_day": 300,
            "price_weekend": 800,
            "km_included": "200 km/jour inclus",
            "specs": {"power": "400 ch"},
            "category": "berline",
            "available": True,
            "order": 99
        }
        r = requests.post(f"{EL_API}/admin/vehicles", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        data = r.json()
        assert "id" in data
        TestEasyLocAdminVehicleCRUD.created_id = data["id"]

        # Verify persistence via GET
        get_r = requests.get(f"{EL_API}/vehicles/{data['id']}", timeout=10)
        assert get_r.status_code == 200
        assert get_r.json()["name"] == payload["name"]

    def test_update_vehicle(self, auth_headers):
        vid = TestEasyLocAdminVehicleCRUD.created_id
        assert vid
        r = requests.put(f"{EL_API}/admin/vehicles/{vid}", headers=auth_headers,
                         json={"price_day": 350}, timeout=10)
        assert r.status_code == 200

        get_r = requests.get(f"{EL_API}/vehicles/{vid}", timeout=10)
        assert get_r.json()["price_day"] == 350

    def test_delete_vehicle(self, auth_headers):
        vid = TestEasyLocAdminVehicleCRUD.created_id
        assert vid
        r = requests.delete(f"{EL_API}/admin/vehicles/{vid}", headers=auth_headers, timeout=10)
        assert r.status_code == 200

        get_r = requests.get(f"{EL_API}/vehicles/{vid}", timeout=10)
        assert get_r.status_code == 404


class TestEasyLocAdminContent:
    def test_update_content_section(self, auth_headers, s):
        original = s.get(f"{EL_API}/content/hero").json()
        new_content = {**original, "title": "TEST_Hero_Title"}
        r = requests.put(f"{EL_API}/admin/content/hero", headers=auth_headers,
                         json=new_content, timeout=10)
        assert r.status_code == 200
        # Verify update
        get_r = s.get(f"{EL_API}/content/hero", timeout=10)
        assert get_r.json()["title"] == "TEST_Hero_Title"
        # Restore
        requests.put(f"{EL_API}/admin/content/hero", headers=auth_headers,
                     json=original, timeout=10)


class TestEasyLocAdminReservation:
    def test_update_reservation_status(self, auth_headers, s):
        # Create a reservation first (public)
        payload = {
            "nom": "TEST_UpdateStatus", "prenom": "T", "telephone": "0000",
            "email": "t@test.com", "vehicule": "X",
            "date_debut": "2026-03-01", "date_fin": "2026-03-02"
        }
        r = s.post(f"{EL_API}/reservations", json=payload, timeout=10)
        rid = r.json()["id"]

        upd = requests.put(f"{EL_API}/admin/reservations/{rid}", headers=auth_headers,
                           json={"status": "confirmed"}, timeout=10)
        assert upd.status_code == 200

        # Verify via list
        lst = requests.get(f"{EL_API}/admin/reservations", headers=auth_headers, timeout=10).json()
        found = next((x for x in lst if x.get("id") == rid), None)
        assert found and found.get("status") == "confirmed"


# ========= EasyLeaz NON-REGRESSION =========
class TestEasyLeazRegression:
    def test_vehicles_endpoint(self, s):
        r = s.get(f"{API}/vehicles", timeout=10)
        assert r.status_code == 200
        vehicles = r.json()
        assert isinstance(vehicles, list)
        # Expected 6 seed vehicles (may be >6 if tests previously added)
        assert len(vehicles) >= 1

    def test_cms_endpoint(self, s):
        r = s.get(f"{API}/cms", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_auth_login(self, s):
        r = s.post(f"{API}/auth/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        assert r.status_code == 200
        assert "access_token" in r.json() or "token" in r.json()

    def test_leads_create(self):
        # /api/leads uses multipart/form-data
        data = {
            "first_name": "TEST_Non",
            "last_name": "Regression",
            "email": "test_nonreg@example.com",
            "phone": "0780000000",
            "desired_vehicle": "Any",
        }
        r = requests.post(f"{API}/leads", data=data, timeout=15)
        # Lead creation should not fail even without SMTP
        assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
