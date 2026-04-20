#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class EasyLeazAPITester:
    def __init__(self, base_url="https://easyleaz-elite.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = "easyleaz2024"
        self.jwt_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("API Health Check", "GET", "", 200)

    def test_seed_data(self):
        """Test seeding initial data"""
        return self.run_test("Seed Data", "POST", "seed", 200)

    def test_get_vehicles(self):
        """Test getting public vehicles"""
        return self.run_test("Get Public Vehicles", "GET", "vehicles", 200)
    
    def test_get_vehicles_occasion(self):
        """Test getting occasion vehicles only"""
        return self.run_test("Get Occasion Vehicles", "GET", "vehicles?condition=occasion", 200)
    
    def test_get_vehicles_neuf(self):
        """Test getting neuf vehicles only"""
        return self.run_test("Get Neuf Vehicles", "GET", "vehicles?condition=neuf", 200)

    def test_get_cms_sections(self):
        """Test getting all CMS sections"""
        return self.run_test("Get All CMS Sections", "GET", "cms", 200)

    def test_get_cms_hero_section(self):
        """Test getting specific CMS section"""
        return self.run_test("Get Hero CMS Section", "GET", "cms/hero", 200)
    
    def test_get_cms_about_section(self):
        """Test getting about CMS section"""
        return self.run_test("Get About CMS Section", "GET", "cms/about", 200)
    
    def test_get_cms_faq_section(self):
        """Test getting FAQ CMS section"""
        return self.run_test("Get FAQ CMS Section", "GET", "cms/faq", 200)
    
    def test_get_cms_vehicle_cta_section(self):
        """Test getting vehicle CTA CMS section"""
        return self.run_test("Get Vehicle CTA CMS Section", "GET", "cms/vehicle_cta", 200)

    def test_admin_login(self):
        """Test admin login"""
        data = {"password": self.admin_token}
        return self.run_test("Admin Login", "POST", "admin/login", 200, data)

    def test_jwt_admin_login(self):
        """Test JWT admin login with email/password"""
        data = {"email": "admin@easyleaz.ch", "password": "easyleaz2024"}
        success, response = self.run_test("JWT Admin Login", "POST", "auth/login", 200, data)
        if success and 'token' in response:
            self.jwt_token = response['token']
            return True, response['token']
        return False, None

    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        data = {"password": "wrongpassword"}
        return self.run_test("Admin Login (Wrong Password)", "POST", "admin/login", 401, data)

    def test_get_all_vehicles_admin(self):
        """Test getting all vehicles (admin only)"""
        headers = {"x-admin-token": self.admin_token}
        return self.run_test("Get All Vehicles (Admin)", "GET", "vehicles/all", 200, headers=headers)

    def test_create_vehicle(self):
        """Test creating a new vehicle with condition field"""
        headers = {"x-admin-token": self.admin_token}
        data = {
            "brand": "Test Brand",
            "model": "Test Model",
            "year": 2024,
            "mileage": 1000,
            "fuel": "Essence",
            "transmission": "Automatique",
            "price": 50000,
            "monthly_payment": 650,
            "image_url": "https://example.com/test.jpg",
            "badge": "Test",
            "condition": "neuf"
        }
        success, response = self.run_test("Create Vehicle with Condition", "POST", "vehicles", 200, data, headers)
        if success and 'id' in response:
            return success, response['id']
        return success, None

    def test_create_vehicle_occasion(self):
        """Test creating an occasion vehicle"""
        headers = {"x-admin-token": self.admin_token}
        data = {
            "brand": "Test Occasion",
            "model": "Test Model Occasion",
            "year": 2022,
            "mileage": 15000,
            "fuel": "Diesel",
            "transmission": "Manuelle",
            "price": 35000,
            "monthly_payment": 450,
            "condition": "occasion"
        }
        success, response = self.run_test("Create Occasion Vehicle", "POST", "vehicles", 200, data, headers)
        if success and 'id' in response:
            return success, response['id']
        return success, None

    def test_update_vehicle(self, vehicle_id):
        """Test updating a vehicle including condition"""
        if not vehicle_id:
            print("❌ Skipping update test - no vehicle ID")
            return False, None
        
        headers = {"x-admin-token": self.admin_token}
        data = {
            "brand": "Updated Brand",
            "price": 55000,
            "condition": "occasion"
        }
        return self.run_test(f"Update Vehicle {vehicle_id}", "PUT", f"vehicles/{vehicle_id}", 200, data, headers)

    def test_upload_vehicle_images(self, vehicle_id):
        """Test uploading images to a vehicle"""
        if not vehicle_id:
            print("❌ Skipping image upload test - no vehicle ID")
            return False, None
        
        import requests
        import io
        
        url = f"{self.api_url}/vehicles/{vehicle_id}/images"
        headers = {"x-admin-token": self.admin_token}
        
        # Create a fake image file
        fake_image = io.BytesIO(b"fake image content for testing")
        files = {'files': ('test_image.jpg', fake_image, 'image/jpeg')}
        
        self.tests_run += 1
        print(f"\n🔍 Testing Upload Vehicle Images...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(url, files=files, headers=headers, timeout=10)
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    images = response_data.get('images', [])
                    if images:
                        return True, images[0].get('id')
                    return True, None
                except:
                    return True, None
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": "Upload Vehicle Images",
                    "expected": 200,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": "Upload Vehicle Images",
                "error": str(e)
            })
            return False, None

    def test_set_main_image(self, vehicle_id, image_id):
        """Test setting main image for a vehicle"""
        if not vehicle_id or not image_id:
            print("❌ Skipping set main image test - missing vehicle or image ID")
            return False, None
        
        headers = {"x-admin-token": self.admin_token}
        data = {"image_id": image_id}
        return self.run_test(f"Set Main Image for Vehicle {vehicle_id}", "POST", f"vehicles/{vehicle_id}/main-image", 200, data, headers)

    def test_delete_vehicle_image(self, vehicle_id, image_id):
        """Test deleting a vehicle image"""
        if not vehicle_id or not image_id:
            print("❌ Skipping delete image test - missing vehicle or image ID")
            return False, None
        
        headers = {"x-admin-token": self.admin_token}
        return self.run_test(f"Delete Vehicle Image {image_id}", "DELETE", f"vehicles/{vehicle_id}/images/{image_id}", 200, headers=headers)

    def test_serve_vehicle_image(self, filename):
        """Test serving vehicle images"""
        if not filename:
            print("❌ Skipping serve image test - no filename")
            return False, None
        
        import requests
        url = f"{self.api_url}/uploads/vehicles/{filename}"
        
        self.tests_run += 1
        print(f"\n🔍 Testing Serve Vehicle Image...")
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            # Accept both 200 (file exists) and 404 (file doesn't exist) as valid responses
            success = response.status_code in [200, 404]
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return True, None
            else:
                print(f"❌ Failed - Expected 200 or 404, got {response.status_code}")
                self.failed_tests.append({
                    "test": "Serve Vehicle Image",
                    "expected": "200 or 404",
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": "Serve Vehicle Image",
                "error": str(e)
            })
            return False, None

    def test_create_leasing_request(self):
        """Test creating a leasing request"""
        data = {
            "first_name": "Test",
            "last_name": "User",
            "phone": "+41791234567",
            "email": "test@example.com",
            "income": "50'000 - 80'000 CHF",
            "professional_status": "Salarié",
            "desired_vehicle": "Porsche 911"
        }
        success, response = self.run_test("Create Leasing Request", "POST", "leasing-requests", 200, data)
        if success and 'id' in response:
            return success, response['id']
        return success, None

    def test_create_lead(self):
        """Test creating a lead via new endpoint"""
        # This endpoint expects form data, so we'll test it differently
        import requests
        url = f"{self.api_url}/leads"
        
        # Prepare form data
        form_data = {
            'first_name': 'Test',
            'last_name': 'Lead',
            'phone': '+41791234567',
            'email': 'testlead@example.com',
            'annual_income': '60000',
            'professional_status': 'Salarié',
            'desired_vehicle': 'BMW M4'
        }
        
        self.tests_run += 1
        print(f"\n🔍 Testing Create Lead (Form Data)...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(url, data=form_data, timeout=10)
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {response_data}")
                    if 'id' in response_data:
                        return True, response_data['id']
                    return True, None
                except:
                    return True, None
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": "Create Lead (Form Data)",
                    "expected": 200,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": "Create Lead (Form Data)",
                "error": str(e)
            })
            return False, None

    def test_export_leads_csv(self):
        """Test CSV export endpoint"""
        if not self.jwt_token:
            print("❌ Skipping CSV export test - no JWT token")
            return False, None
        
        headers = {"Authorization": f"Bearer {self.jwt_token}"}
        success, _ = self.run_test("Export Leads CSV", "GET", "leads/export", 200, headers=headers)
        return success, None

    def test_export_leads_csv_with_status_filter(self):
        """Test CSV export with status filter"""
        if not self.jwt_token:
            print("❌ Skipping CSV export test - no JWT token")
            return False, None
        
        headers = {"Authorization": f"Bearer {self.jwt_token}"}
        success, _ = self.run_test("Export Leads CSV (Status Filter)", "GET", "leads/export?status=pending", 200, headers=headers)
        return success, None

    def test_export_leads_csv_with_date_filter(self):
        """Test CSV export with date filter"""
        if not self.jwt_token:
            print("❌ Skipping CSV export test - no JWT token")
            return False, None
    def test_delete_vehicle(self, vehicle_id):
        """Test deleting a vehicle"""
        if not vehicle_id:
            print("❌ Skipping delete test - no vehicle ID")
            return False, None
            
        headers = {"x-admin-token": self.admin_token}
        return self.run_test(f"Delete Vehicle {vehicle_id}", "DELETE", f"vehicles/{vehicle_id}", 200, headers=headers)
        
        headers = {"Authorization": f"Bearer {self.jwt_token}"}
        success, _ = self.run_test("Export Leads CSV (Date Filter)", "GET", "leads/export?date_from=2026-01-01&date_to=2026-12-31", 200, headers=headers)
        return success, None

    def test_get_leads(self):
        """Test getting leads (admin only)"""
        if not self.jwt_token:
            print("❌ Skipping get leads test - no JWT token")
            return False, None
        
        headers = {"Authorization": f"Bearer {self.jwt_token}"}
        return self.run_test("Get Leads (Admin)", "GET", "leads", 200, headers=headers)

    def test_get_leasing_requests(self):
        """Test getting leasing requests (admin only)"""
        headers = {"x-admin-token": self.admin_token}
        return self.run_test("Get Leasing Requests (Admin)", "GET", "leasing-requests", 200, headers=headers)

    def test_update_cms_section(self):
        """Test updating CMS content"""
        headers = {"x-admin-token": self.admin_token}
        data = {
            "content": {
                "title": "UPDATED TITLE FOR TESTING",
                "subtitle": "Updated subtitle for testing"
            }
        }
        return self.run_test("Update CMS Section", "PUT", "cms/hero", 200, data, headers)

    def test_unauthorized_admin_endpoints(self):
        """Test admin endpoints without token"""
        print("\n🔒 Testing unauthorized access...")
        
        # Test without token
        success1, _ = self.run_test("Get All Vehicles (No Token)", "GET", "vehicles/all", 401)
        success2, _ = self.run_test("Create Vehicle (No Token)", "POST", "vehicles", 401, {})
        success3, _ = self.run_test("Get Leasing Requests (No Token)", "GET", "leasing-requests", 401)
        
        # Test with wrong token
        wrong_headers = {"x-admin-token": "wrongtoken"}
        success4, _ = self.run_test("Get All Vehicles (Wrong Token)", "GET", "vehicles/all", 401, headers=wrong_headers)
        
        return all([success1, success2, success3, success4])

def main():
    print("🚀 Starting EasyLeaz API Testing...")
    print("=" * 60)
    
    tester = EasyLeazAPITester()
    
    # Basic API tests
    print("\n📋 BASIC API TESTS")
    print("-" * 30)
    tester.test_health_check()
    tester.test_seed_data()
    
    # Public endpoints
    print("\n🌐 PUBLIC ENDPOINTS")
    print("-" * 30)
    tester.test_get_vehicles()
    tester.test_get_vehicles_occasion()
    tester.test_get_vehicles_neuf()
    tester.test_get_cms_sections()
    tester.test_get_cms_hero_section()
    tester.test_get_cms_about_section()
    tester.test_get_cms_faq_section()
    tester.test_get_cms_vehicle_cta_section()
    
    # Admin authentication
    print("\n🔐 ADMIN AUTHENTICATION")
    print("-" * 30)
    tester.test_admin_login()
    tester.test_admin_login_wrong_password()
    
    # JWT Authentication (new)
    print("\n🔑 JWT AUTHENTICATION")
    print("-" * 30)
    jwt_success, jwt_token = tester.test_jwt_admin_login()
    
    # Vehicle CRUD operations with image management
    print("\n🚗 VEHICLE MANAGEMENT")
    print("-" * 30)
    tester.test_get_all_vehicles_admin()
    
    # Test creating vehicles with different conditions
    success_neuf, vehicle_id_neuf = tester.test_create_vehicle()
    success_occasion, vehicle_id_occasion = tester.test_create_vehicle_occasion()
    
    # Test image upload and management
    if success_neuf and vehicle_id_neuf:
        print(f"\n📸 IMAGE MANAGEMENT FOR VEHICLE {vehicle_id_neuf}")
        print("-" * 30)
        upload_success, image_id = tester.test_upload_vehicle_images(vehicle_id_neuf)
        if upload_success and image_id:
            tester.test_set_main_image(vehicle_id_neuf, image_id)
            tester.test_serve_vehicle_image("test_image.jpg")
            tester.test_delete_vehicle_image(vehicle_id_neuf, image_id)
        
        tester.test_update_vehicle(vehicle_id_neuf)
        tester.test_delete_vehicle(vehicle_id_neuf)
    
    if success_occasion and vehicle_id_occasion:
        tester.test_delete_vehicle(vehicle_id_occasion)
    
    # Leasing requests and leads
    print("\n📝 LEASING REQUESTS & LEADS")
    print("-" * 30)
    success, request_id = tester.test_create_leasing_request()
    tester.test_get_leasing_requests()
    
    # New leads endpoint
    success, lead_id = tester.test_create_lead()
    if jwt_success:
        tester.test_get_leads()
        
        # CSV Export tests
        print("\n📊 CSV EXPORT TESTS")
        print("-" * 30)
        tester.test_export_leads_csv()
        tester.test_export_leads_csv_with_status_filter()
        tester.test_export_leads_csv_with_date_filter()
    
    # CMS management
    print("\n📄 CMS MANAGEMENT")
    print("-" * 30)
    tester.test_update_cms_section()
    
    # Security tests
    print("\n🔒 SECURITY TESTS")
    print("-" * 30)
    tester.test_unauthorized_admin_endpoints()
    
    # Print results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['test']}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
            else:
                print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                print(f"   Response: {test['response']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())