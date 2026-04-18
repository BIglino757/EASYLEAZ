#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class CRMFeaturesTester:
    def __init__(self, base_url="https://easyleaz-elite.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.jwt_token = None
        self.admin_info = None
        self.test_lead_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": name, "details": details})
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")

    def test_jwt_login(self):
        """Test JWT authentication with admin@easyleaz.ch"""
        try:
            data = {
                "email": "admin@easyleaz.ch",
                "password": "easyleaz2024"
            }
            response = requests.post(f"{self.api_url}/auth/login", json=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                self.jwt_token = result.get("token")
                self.admin_info = result.get("admin")
                self.log_test("JWT Login", True, f"Token received for {self.admin_info.get('email')}")
                return True
            else:
                self.log_test("JWT Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("JWT Login", False, f"Error: {str(e)}")
            return False

    def test_auth_me(self):
        """Test GET /api/auth/me with Bearer token"""
        if not self.jwt_token:
            self.log_test("Auth Me", False, "No JWT token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.jwt_token}"}
            response = requests.get(f"{self.api_url}/auth/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                admin_data = response.json()
                self.log_test("Auth Me", True, f"Admin info: {admin_data}")
                return True
            else:
                self.log_test("Auth Me", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Auth Me", False, f"Error: {str(e)}")
            return False

    def test_create_lead_multipart(self):
        """Test POST /api/leads with multipart form data"""
        try:
            # Test with form data (no files for backend testing)
            data = {
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+41791234567",
                "email": "john.doe@example.com",
                "marital_status": "Marié(e)",
                "nationality": "Française",
                "birth_date": "1985-05-15",
                "address": "Rue de la Paix 123, 1200 Genève",
                "residence_permit": "Permis B",
                "children_count": "2",
                "housing_cost": "2000",
                "employment_date": "2018-03-01",
                "annual_income": "80'000 - 120'000 CHF",
                "professional_status": "Salarié",
                "desired_vehicle": "Mercedes-AMG GT 63 S"
            }
            
            response = requests.post(f"{self.api_url}/leads", data=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                self.test_lead_id = result.get("id")
                self.log_test("Create Lead (Multipart)", True, f"Lead created with ID: {self.test_lead_id}")
                return True
            else:
                self.log_test("Create Lead (Multipart)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Lead (Multipart)", False, f"Error: {str(e)}")
            return False

    def test_get_leads(self):
        """Test GET /api/leads with Bearer token"""
        if not self.jwt_token:
            self.log_test("Get Leads", False, "No JWT token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.jwt_token}"}
            response = requests.get(f"{self.api_url}/leads", headers=headers, timeout=10)
            
            if response.status_code == 200:
                leads = response.json()
                self.log_test("Get Leads", True, f"Retrieved {len(leads)} leads")
                return True
            else:
                self.log_test("Get Leads", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Leads", False, f"Error: {str(e)}")
            return False

    def test_leads_stats(self):
        """Test GET /api/leads/stats with Bearer token"""
        if not self.jwt_token:
            self.log_test("Leads Stats", False, "No JWT token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.jwt_token}"}
            response = requests.get(f"{self.api_url}/leads/stats", headers=headers, timeout=10)
            
            if response.status_code == 200:
                stats = response.json()
                expected_keys = ['total', 'pending', 'approved', 'rejected', 'recent']
                has_all_keys = all(key in stats for key in expected_keys)
                
                if has_all_keys:
                    self.log_test("Leads Stats", True, f"Stats: Total={stats['total']}, Pending={stats['pending']}, Approved={stats['approved']}, Rejected={stats['rejected']}")
                    return True
                else:
                    self.log_test("Leads Stats", False, f"Missing expected keys in response: {stats}")
                    return False
            else:
                self.log_test("Leads Stats", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Leads Stats", False, f"Error: {str(e)}")
            return False

    def test_update_lead_status(self):
        """Test PATCH /api/leads/{id} with status update"""
        if not self.jwt_token or not self.test_lead_id:
            self.log_test("Update Lead Status", False, "No JWT token or lead ID available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.jwt_token}"}
            data = {"status": "approved"}
            response = requests.patch(f"{self.api_url}/leads/{self.test_lead_id}", json=data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                updated_lead = response.json()
                if updated_lead.get("status") == "approved":
                    self.log_test("Update Lead Status", True, f"Lead status updated to: {updated_lead['status']}")
                    return True
                else:
                    self.log_test("Update Lead Status", False, f"Status not updated correctly: {updated_lead}")
                    return False
            else:
                self.log_test("Update Lead Status", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Update Lead Status", False, f"Error: {str(e)}")
            return False

    def test_delete_lead(self):
        """Test DELETE /api/leads/{id}"""
        if not self.jwt_token or not self.test_lead_id:
            self.log_test("Delete Lead", False, "No JWT token or lead ID available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.jwt_token}"}
            response = requests.delete(f"{self.api_url}/leads/{self.test_lead_id}", headers=headers, timeout=10)
            
            if response.status_code == 200:
                self.log_test("Delete Lead", True, "Lead deleted successfully")
                return True
            else:
                self.log_test("Delete Lead", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Delete Lead", False, f"Error: {str(e)}")
            return False

    def run_crm_tests(self):
        """Run all CRM-specific tests"""
        print("🚀 Starting CRM Features Testing")
        print("=" * 50)
        
        # Authentication tests
        print("\n🔐 JWT Authentication Tests")
        if not self.test_jwt_login():
            print("❌ JWT authentication failed, stopping tests")
            return False
        
        self.test_auth_me()
        
        # Leads management tests
        print("\n📋 Leads Management Tests")
        self.test_create_lead_multipart()
        self.test_get_leads()
        self.test_leads_stats()
        self.test_update_lead_status()
        self.test_delete_lead()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 CRM Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CRMFeaturesTester()
    success = tester.run_crm_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())