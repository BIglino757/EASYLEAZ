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

    def test_get_cms_sections(self):
        """Test getting all CMS sections"""
        return self.run_test("Get All CMS Sections", "GET", "cms", 200)

    def test_get_cms_hero_section(self):
        """Test getting specific CMS section"""
        return self.run_test("Get Hero CMS Section", "GET", "cms/hero", 200)

    def test_admin_login(self):
        """Test admin login"""
        data = {"password": self.admin_token}
        return self.run_test("Admin Login", "POST", "admin/login", 200, data)

    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        data = {"password": "wrongpassword"}
        return self.run_test("Admin Login (Wrong Password)", "POST", "admin/login", 401, data)

    def test_get_all_vehicles_admin(self):
        """Test getting all vehicles (admin only)"""
        headers = {"x-admin-token": self.admin_token}
        return self.run_test("Get All Vehicles (Admin)", "GET", "vehicles/all", 200, headers=headers)

    def test_create_vehicle(self):
        """Test creating a new vehicle"""
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
            "badge": "Test"
        }
        success, response = self.run_test("Create Vehicle", "POST", "vehicles", 200, data, headers)
        if success and 'id' in response:
            return success, response['id']
        return success, None

    def test_update_vehicle(self, vehicle_id):
        """Test updating a vehicle"""
        if not vehicle_id:
            print("❌ Skipping update test - no vehicle ID")
            return False, None
        
        headers = {"x-admin-token": self.admin_token}
        data = {
            "brand": "Updated Brand",
            "price": 55000
        }
        return self.run_test(f"Update Vehicle {vehicle_id}", "PUT", f"vehicles/{vehicle_id}", 200, data, headers)

    def test_delete_vehicle(self, vehicle_id):
        """Test deleting a vehicle"""
        if not vehicle_id:
            print("❌ Skipping delete test - no vehicle ID")
            return False, None
            
        headers = {"x-admin-token": self.admin_token}
        return self.run_test(f"Delete Vehicle {vehicle_id}", "DELETE", f"vehicles/{vehicle_id}", 200, headers=headers)

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
    tester.test_get_cms_sections()
    tester.test_get_cms_hero_section()
    
    # Admin authentication
    print("\n🔐 ADMIN AUTHENTICATION")
    print("-" * 30)
    tester.test_admin_login()
    tester.test_admin_login_wrong_password()
    
    # Vehicle CRUD operations
    print("\n🚗 VEHICLE MANAGEMENT")
    print("-" * 30)
    tester.test_get_all_vehicles_admin()
    success, vehicle_id = tester.test_create_vehicle()
    if success and vehicle_id:
        tester.test_update_vehicle(vehicle_id)
        tester.test_delete_vehicle(vehicle_id)
    
    # Leasing requests
    print("\n📝 LEASING REQUESTS")
    print("-" * 30)
    success, request_id = tester.test_create_leasing_request()
    tester.test_get_leasing_requests()
    
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