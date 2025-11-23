"""
Receptionist Portal API Test Client
Tests all receptionist-specific APIs for patient management and walk-in appointments
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Configuration
BASE_URL = "http://localhost:3002"
RECEPTIONIST_EMAIL = "receptionist@hospital.com"
RECEPTIONIST_PASSWORD = "password123"

class ReceptionistAPIClient:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.headers: Dict[str, str] = {}

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Login as receptionist"""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data["accessToken"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        return data

    # ============================================================================
    # PROFILE & DASHBOARD
    # ============================================================================

    def get_profile(self) -> Dict[str, Any]:
        """Get receptionist profile"""
        response = requests.get(
            f"{self.base_url}/receptionists/profile/me",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        response = requests.get(
            f"{self.base_url}/receptionists/dashboard/stats",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    # ============================================================================
    # PATIENT MANAGEMENT
    # ============================================================================

    def register_patient(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new patient"""
        response = requests.post(
            f"{self.base_url}/receptionists/patients/register",
            headers=self.headers,
            json=patient_data
        )
        response.raise_for_status()
        return response.json()

    def search_patients(self, search_term: str) -> list:
        """Search for existing patients"""
        response = requests.get(
            f"{self.base_url}/receptionists/patients/search",
            headers=self.headers,
            params={"q": search_term}
        )
        response.raise_for_status()
        return response.json()

    def get_patient_by_id(self, patient_id: int) -> Dict[str, Any]:
        """Get patient details by ID"""
        response = requests.get(
            f"{self.base_url}/receptionists/patients/{patient_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    # ============================================================================
    # APPOINTMENT MANAGEMENT
    # ============================================================================

    def get_doctors_with_slots(self) -> list:
        """Get all doctors with available slots"""
        response = requests.get(
            f"{self.base_url}/appointment-slots/doctors-with-slots",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def book_walkin_appointment(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Book a walk-in appointment"""
        response = requests.post(
            f"{self.base_url}/receptionists/appointments/book-walkin",
            headers=self.headers,
            json=appointment_data
        )
        response.raise_for_status()
        return response.json()

    def get_my_appointments(
        self, 
        status: Optional[str] = None,
        time_filter: Optional[str] = None,
        patient_search: Optional[str] = None
    ) -> list:
        """Get appointments booked by this receptionist"""
        params = {}
        if status:
            params["status"] = status
        if time_filter:
            params["timeFilter"] = time_filter
        if patient_search:
            params["patientSearch"] = patient_search

        response = requests.get(
            f"{self.base_url}/receptionists/appointments/my-appointments",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80)


def print_json(data: Any, indent: int = 2):
    """Pretty print JSON data"""
    print(json.dumps(data, indent=indent, default=str))


def main():
    """Run comprehensive tests for all receptionist APIs"""
    client = ReceptionistAPIClient()
    
    # Test counters
    total_tests = 0
    passed_tests = 0
    
    try:
        # ========================================================================
        # TEST 1: Login
        # ========================================================================
        print_section("TEST 1: Receptionist Login")
        total_tests += 1
        
        login_response = client.login(RECEPTIONIST_EMAIL, RECEPTIONIST_PASSWORD)
        print("✓ Login successful")
        print(f"Token: {login_response['accessToken'][:50]}...")
        print_json({"user": login_response["user"]})
        passed_tests += 1

        # ========================================================================
        # TEST 2: Get Profile
        # ========================================================================
        print_section("TEST 2: Get Receptionist Profile")
        total_tests += 1
        
        profile = client.get_profile()
        print("✓ Profile retrieved successfully")
        print_json(profile)
        passed_tests += 1

        # ========================================================================
        # TEST 3: Get Dashboard Stats
        # ========================================================================
        print_section("TEST 3: Get Dashboard Statistics")
        total_tests += 1
        
        stats = client.get_dashboard_stats()
        print("✓ Dashboard stats retrieved successfully")
        print_json(stats)
        passed_tests += 1

        # ========================================================================
        # TEST 4: Register New Patient
        # ========================================================================
        print_section("TEST 4: Register New Patient")
        total_tests += 1
        
        # Generate unique email for testing
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        new_patient_data = {
            "firstName": "Fatima",
            "lastName": "Malik",
            "email": f"fatima.malik.{timestamp}@test.com",
            "password": "patient123",
            "gender": "FEMALE",
            "cnic": f"42301-{timestamp[-7:]}-3",
            "dateOfBirth": "1995-08-20",
            "bloodGroup": "A+",
            "phoneNumber": "+92-333-1234567",
            "address": "456 Garden Road, Lahore, Pakistan",
            "emergencyContact": "+92-333-7654321",
            "allergies": "Penicillin",
            "medicalHistory": "Previous surgery in 2020",
            "familyHistory": "Father has diabetes"
        }
        
        register_response = client.register_patient(new_patient_data)
        print("✓ Patient registered successfully")
        print_json(register_response)
        
        new_patient_id = register_response["patient"]["id"]
        passed_tests += 1

        # ========================================================================
        # TEST 5: Search Patients
        # ========================================================================
        print_section("TEST 5: Search Patients")
        total_tests += 1
        
        # Search by first name
        search_results = client.search_patients("Fatima")
        print(f"✓ Found {len(search_results)} patient(s) matching 'Fatima'")
        print_json(search_results[:3])  # Show first 3 results
        passed_tests += 1

        # ========================================================================
        # TEST 6: Get Patient Details
        # ========================================================================
        print_section("TEST 6: Get Patient Details by ID")
        total_tests += 1
        
        patient_details = client.get_patient_by_id(new_patient_id)
        print(f"✓ Patient details retrieved for ID: {new_patient_id}")
        print_json(patient_details)
        passed_tests += 1

        # ========================================================================
        # TEST 7: Search Existing Patient
        # ========================================================================
        print_section("TEST 7: Search for Existing Patient (Ahmed)")
        total_tests += 1
        
        existing_patient_search = client.search_patients("Ahmed")
        print(f"✓ Found {len(existing_patient_search)} patient(s) matching 'Ahmed'")
        print_json(existing_patient_search)
        
        if existing_patient_search:
            existing_patient_id = existing_patient_search[0]["id"]
        else:
            print("⚠ No existing patient found, using newly created patient")
            existing_patient_id = new_patient_id
        
        passed_tests += 1

        # ========================================================================
        # TEST 8: Get Doctors with Available Slots
        # ========================================================================
        print_section("TEST 8: Get Doctors with Available Slots")
        total_tests += 1
        
        doctors = client.get_doctors_with_slots()
        print(f"✓ Found {len(doctors)} doctor(s) with available slots")
        
        if doctors:
            # Show first doctor with slots
            print("\nFirst doctor with available slots:")
            doctor = doctors[0]
            print(f"Dr. {doctor['firstName']} {doctor['lastName']}")
            print(f"Department: {doctor['departmentName']}")
            print(f"Available slots: {doctor.get('availableSlotsCount', 0)}")
            
            if doctor.get('upcomingSlots'):
                print("\nUpcoming slots:")
                for slot in doctor['upcomingSlots'][:3]:  # Show first 3 slots
                    print(f"  - Slot ID: {slot['id']}")
                    print(f"    Time: {slot['startTime']} to {slot['endTime']}")
                    print(f"    Bookable: {slot['isBookable']}, Booked: {slot['isBooked']}")
        else:
            print("⚠ No doctors with available slots found")
        
        passed_tests += 1

        # ========================================================================
        # TEST 9: Book Walk-in Appointment for New Patient
        # ========================================================================
        print_section("TEST 9: Book Walk-in Appointment for New Patient")
        total_tests += 1
        
        if doctors and doctors[0].get('upcomingSlots'):
            # Find first available slot
            available_slot = None
            for slot in doctors[0]['upcomingSlots']:
                if slot['isBookable'] and not slot['isBooked']:
                    available_slot = slot
                    break
            
            if available_slot:
                walkin_data = {
                    "patientId": new_patient_id,
                    "slotId": available_slot['id'],
                    "reason": "Walk-in checkup - First visit"
                }
                
                appointment = client.book_walkin_appointment(walkin_data)
                print("✓ Walk-in appointment booked successfully")
                print_json(appointment)
                passed_tests += 1
            else:
                print("⚠ No available slots found, skipping appointment booking")
                total_tests -= 1
        else:
            print("⚠ No doctors or slots available, skipping appointment booking")
            total_tests -= 1

        # ========================================================================
        # TEST 10: Book Walk-in Appointment for Existing Patient
        # ========================================================================
        print_section("TEST 10: Book Walk-in Appointment for Existing Patient")
        total_tests += 1
        
        if doctors and len(doctors[0].get('upcomingSlots', [])) > 1:
            # Find another available slot
            available_slot = None
            for slot in doctors[0]['upcomingSlots'][1:]:
                if slot['isBookable'] and not slot['isBooked']:
                    available_slot = slot
                    break
            
            if available_slot:
                walkin_data = {
                    "patientId": existing_patient_id,
                    "slotId": available_slot['id'],
                    "reason": "Walk-in follow-up visit"
                }
                
                appointment = client.book_walkin_appointment(walkin_data)
                print("✓ Walk-in appointment booked for existing patient")
                print_json(appointment)
                passed_tests += 1
            else:
                print("⚠ No available slots found, skipping second appointment booking")
                total_tests -= 1
        else:
            print("⚠ Not enough slots available, skipping second appointment booking")
            total_tests -= 1

        # ========================================================================
        # TEST 11: Get All My Appointments
        # ========================================================================
        print_section("TEST 11: Get All My Appointments")
        total_tests += 1
        
        all_appointments = client.get_my_appointments()
        print(f"✓ Retrieved {len(all_appointments)} total appointment(s)")
        
        if all_appointments:
            print("\nFirst few appointments:")
            print_json(all_appointments[:3])
        
        passed_tests += 1

        # ========================================================================
        # TEST 12: Get Upcoming Appointments
        # ========================================================================
        print_section("TEST 12: Get Upcoming Appointments")
        total_tests += 1
        
        upcoming = client.get_my_appointments(status="BOOKED", time_filter="upcoming")
        print(f"✓ Retrieved {len(upcoming)} upcoming appointment(s)")
        
        if upcoming:
            print_json(upcoming[:3])
        
        passed_tests += 1

        # ========================================================================
        # TEST 13: Get Past Appointments
        # ========================================================================
        print_section("TEST 13: Get Past Appointments")
        total_tests += 1
        
        past = client.get_my_appointments(time_filter="past")
        print(f"✓ Retrieved {len(past)} past appointment(s)")
        
        if past:
            print_json(past[:3])
        
        passed_tests += 1

        # ========================================================================
        # TEST 14: Search Appointments by Patient
        # ========================================================================
        print_section("TEST 14: Search Appointments by Patient Name")
        total_tests += 1
        
        patient_appointments = client.get_my_appointments(patient_search="Fatima")
        print(f"✓ Found {len(patient_appointments)} appointment(s) for 'Fatima'")
        
        if patient_appointments:
            print_json(patient_appointments)
        
        passed_tests += 1

        # ========================================================================
        # SUMMARY
        # ========================================================================
        print_section("TEST SUMMARY")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if passed_tests == total_tests:
            print("\n🎉 ALL TESTS PASSED! 🎉")
        else:
            print(f"\n⚠ {total_tests - passed_tests} test(s) failed")

    except requests.exceptions.HTTPError as e:
        print(f"\n❌ HTTP Error: {e}")
        print(f"Response: {e.response.text}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("=" * 80)
    print(" RECEPTIONIST PORTAL API TEST CLIENT")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Receptionist: {RECEPTIONIST_EMAIL}")
    print("=" * 80)
    
    main()
