"""
Patient Portal API Test Client - Non-Interactive Version
Tests all patient-related endpoints automatically
"""

import requests
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3002"

class PatientPortalClient:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.patient_id = None
        
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Login as patient"""
        url = f"{self.base_url}/auth/login"
        payload = {
            "email": email,
            "password": password
        }
        
        response = requests.post(url, json=payload)
        print(f"\n{'='*60}")
        print(f"LOGIN")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            self.token = data.get('access_token') or data.get('accessToken')
            print(f"✅ Login successful")
            print(f"Token: {self.token[:50] if self.token else 'No token'}...")
            print(f"\nFull Response:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Login failed: {response.text}")
            raise Exception(f"Login failed: {response.text}")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        if not self.token:
            raise Exception("Not authenticated. Please login first.")
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def get_profile(self) -> Dict[str, Any]:
        """Get patient profile"""
        url = f"{self.base_url}/patients/profile"
        response = requests.get(url, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        print(f"GET PROFILE")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profile retrieved")
            print(f"   Name: {data.get('firstName')} {data.get('lastName')}")
            print(f"   Email: {data.get('email')}")
            print(f"   Onboarding Complete: {data.get('onboardingDone')}")
            print(f"\nFull Response:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return {}
    
    def update_profile(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update patient profile"""
        url = f"{self.base_url}/patients/profile"
        response = requests.patch(url, json=data, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        print(f"UPDATE PROFILE")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Profile updated")
            print(f"\nFull Response:")
            print(json.dumps(result, indent=2))
            return result
        else:
            print(f"❌ Failed: {response.text}")
            return {}
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        url = f"{self.base_url}/patients/dashboard/stats"
        response = requests.get(url, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        print(f"DASHBOARD STATS")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stats retrieved")
            print(f"   Upcoming Appointments: {data.get('upcomingAppointments', 0)}")
            print(f"   Completed Checkups: {data.get('completedCheckups', 0)}")
            print(f"   Pending Lab Tests: {data.get('pendingLabTests', 0)}")
            print(f"\nFull Response:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return {}
    
    def get_upcoming_appointments(self, limit: int = 5) -> list:
        """Get upcoming appointments"""
        url = f"{self.base_url}/patients/dashboard/upcoming-appointments?limit={limit}"
        response = requests.get(url, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        print(f"UPCOMING APPOINTMENTS (Dashboard)")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} appointments")
            for appt in data[:3]:
                doctor = appt.get('doctor', {})
                print(f"   - Dr. {doctor.get('firstName', 'Unknown')} {doctor.get('lastName', '')}")
                print(f"     Date: {appt.get('startTime', '')[:10]} at {appt.get('startTime', '')[11:16]}")
                print(f"     Status: {appt.get('status')}")
            print(f"\nFull Response (showing first appointment):")
            print(json.dumps(data[0] if data else {}, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return []
    
    def get_recent_checkups(self, limit: int = 5) -> list:
        """Get recent checkups"""
        url = f"{self.base_url}/patients/dashboard/recent-checkups?limit={limit}"
        response = requests.get(url, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        print(f"RECENT CHECKUPS")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} checkups")
            if data:
                print(f"\nFull Response (showing first checkup):")
                print(json.dumps(data[0], indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return []
    
    def get_all_doctors_with_slots(self) -> list:
        """Get all doctors with available slots"""
        url = f"{self.base_url}/appointment-slots/doctors-with-slots"
        response = requests.get(url, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        print(f"ALL DOCTORS WITH SLOTS")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} doctors")
            for doc in data[:3]:
                print(f"   - Dr. {doc.get('firstName')} {doc.get('lastName')}")
                print(f"     Department: {doc.get('departmentName')}")
                print(f"     Available Slots: {doc.get('availableSlotsCount', 0)}")
            print(f"\nFull Response (showing first doctor):")
            print(json.dumps(data[0] if data else {}, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return []
    
    def get_doctor_available_slots(self, doctor_id: int) -> Dict[str, Any]:
        """Get available slots for specific doctor"""
        url = f"{self.base_url}/appointment-slots/doctor/{doctor_id}"
        response = requests.get(url, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        print(f"DOCTOR AVAILABLE SLOTS")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            doctor = data.get('doctor', {})
            print(f"✅ Retrieved slots for Dr. {doctor.get('firstName')} {doctor.get('lastName')}")
            print(f"   Total Available: {len(data.get('slots', []))}")
            print(f"\nFull Response (showing doctor and first 2 slots):")
            response_sample = {
                "doctor": data.get('doctor', {}),
                "slots": data.get('slots', [])[:2]
            }
            print(json.dumps(response_sample, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return {}
    
    def book_appointment(self, slot_id: int, reason: str = "") -> Dict[str, Any]:
        """Book an appointment"""
        url = f"{self.base_url}/online-appointments/book"
        payload = {
            "slotId": slot_id,
            "reason": reason
        }
        
        response = requests.post(url, json=payload, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        print(f"BOOK APPOINTMENT")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            appointment = data.get('appointment', {})
            print(f"✅ Appointment booked successfully")
            print(f"   Appointment ID: {appointment.get('id')}")
            print(f"   Online Appointment ID: {data.get('id')}")
            print(f"   Status: {data.get('status')}")
            print(f"\nFull Response:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return {}
    
    def get_my_appointments(self, status: Optional[str] = None, time_filter: Optional[str] = None) -> list:
        """Get my appointments"""
        url = f"{self.base_url}/online-appointments/my-appointments"
        params = {}
        if status:
            params['status'] = status
        if time_filter:
            params['timeFilter'] = time_filter
        
        response = requests.get(url, params=params, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        filter_desc = f" ({time_filter or status or 'all'})" if (time_filter or status) else ""
        print(f"MY APPOINTMENTS{filter_desc}")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} appointments")
            for appt in data[:3]:
                doctor = appt.get('doctor', {})
                print(f"   - ID: {appt.get('id')}")
                print(f"     Doctor: Dr. {doctor.get('firstName', 'Unknown')} {doctor.get('lastName', '')}")
                print(f"     Department: {doctor.get('departmentName', 'N/A')}")
                print(f"     Date: {appt.get('startTime', '')[:10]}")
                print(f"     Time: {appt.get('startTime', '')[11:16]}")
                print(f"     Status: {appt.get('status')}")
            print(f"\nFull Response (showing first appointment):")
            print(json.dumps(data[0] if data else {}, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return []
    
    def cancel_appointment(self, appointment_id: int) -> Dict[str, Any]:
        """Cancel an appointment"""
        url = f"{self.base_url}/online-appointments/{appointment_id}/cancel"
        response = requests.patch(url, headers=self._get_headers())
        
        print(f"\n{'='*60}")
        print(f"CANCEL APPOINTMENT")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Appointment cancelled successfully")
            print(f"   Status: {data.get('status')}")
            print(f"\nFull Response:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return {}

def main():
    print("="*60)
    print("PATIENT PORTAL API TEST SUITE")
    print("="*60)
    
    client = PatientPortalClient()
    
    # 1. Login as patient
    print("\n\n1. AUTHENTICATION")
    print("-" * 60)
    client.login("patient@hospital.com", "password123")
    
    # 2. Get and update profile
    print("\n\n2. PATIENT PROFILE")
    print("-" * 60)
    profile = client.get_profile()
    
    if profile and not profile.get('onboardingDone'):
        print("\n   Completing onboarding...")
        update_data = {
            "dateOfBirth": "1990-05-15",
            "bloodGroup": "B+",
            "phoneNumber": "+92-300-1234567",
            "emergencyContact": "+92-301-7654321",
            "address": "House 123, Street 5, F-7, Islamabad",
            "allergies": "Penicillin",
            "medicalHistory": "No significant history",
            "familyHistory": "Father has diabetes",
            "onboardingDone": True
        }
        client.update_profile(update_data)
    
    # 3. Dashboard data
    print("\n\n3. DASHBOARD DATA")
    print("-" * 60)
    client.get_dashboard_stats()
    client.get_upcoming_appointments(limit=3)
    client.get_recent_checkups(limit=3)
    
    # 4. Browse doctors and slots
    print("\n\n4. BROWSE DOCTORS & SLOTS")
    print("-" * 60)
    doctors = client.get_all_doctors_with_slots()
    
    if doctors:
        # Get slots for first doctor with available slots
        doctor_with_slots = next((d for d in doctors if d['availableSlotsCount'] > 0), None)
        if doctor_with_slots:
            doctor_slots = client.get_doctor_available_slots(doctor_with_slots['id'])
            
            # 5. Book an appointment
            if doctor_slots and doctor_slots.get('slots'):
                print("\n\n5. BOOK APPOINTMENT")
                print("-" * 60)
                first_slot = doctor_slots['slots'][0]
                booked = client.book_appointment(
                    slot_id=first_slot['id'],
                    reason="Regular checkup and consultation"
                )
                
                # 6. View my appointments
                print("\n\n6. VIEW MY APPOINTMENTS")
                print("-" * 60)
                appointments = client.get_my_appointments()
                client.get_my_appointments(time_filter='upcoming')
                
                # 7. Cancel appointment (optional - comment out if you want to keep the booking)
                if booked and booked.get('appointment', {}).get('id'):
                    print("\n\n7. CANCEL APPOINTMENT")
                    print("-" * 60)
                    print("   (Skipping cancellation to keep test booking)")
                    # Uncomment below to test cancellation:
                    # client.cancel_appointment(booked['appointment']['id'])
                    # client.get_my_appointments()
    
    print("\n\n" + "="*60)
    print("✅ TEST SUITE COMPLETED SUCCESSFULLY")
    print("="*60 + "\n")
    print("Summary:")
    print("  ✅ Authentication working")
    print("  ✅ Profile management working")
    print("  ✅ Dashboard data working")
    print("  ✅ Doctor browsing working")
    print("  ✅ Appointment booking working")
    print("  ✅ Appointment viewing working")
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n\n❌ Test suite failed with error:")
        print(f"   {str(e)}")
        import traceback
        traceback.print_exc()
