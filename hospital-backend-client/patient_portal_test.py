"""
Patient Portal API Test Client
Tests all patient-related endpoints
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
            print(f"Token: {self.token[:50]}..." if self.token else "No token received")
            return data
        else:
            print(f"❌ Login failed: {response.text}")
            return response.json()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        if not self.token:
            raise Exception("Not authenticated. Please login first.")
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    # ============================================================
    # PATIENT PROFILE ENDPOINTS
    # ============================================================
    
    def get_profile(self) -> Dict[str, Any]:
        """Get patient profile"""
        url = f"{self.base_url}/patients/profile"
        
        response = requests.get(url, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"GET PATIENT PROFILE")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.patient_id = data.get('id')
            print(f"✅ Profile retrieved")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return response.json()
    
    def update_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update patient profile"""
        url = f"{self.base_url}/patients/profile"
        
        response = requests.patch(url, json=profile_data, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"UPDATE PATIENT PROFILE")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profile updated")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return response.json()
    
    # ============================================================
    # DASHBOARD ENDPOINTS
    # ============================================================
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        url = f"{self.base_url}/patients/dashboard/stats"
        
        response = requests.get(url, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"GET DASHBOARD STATS")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stats retrieved")
            print(f"   Upcoming Appointments: {data.get('upcomingAppointments', 0)}")
            print(f"   Completed Checkups: {data.get('completedCheckups', 0)}")
            print(f"   Pending Lab Tests: {data.get('pendingLabTests', 0)}")
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return response.json()
    
    def get_upcoming_appointments(self, limit: int = 5) -> list:
        """Get upcoming appointments for dashboard"""
        url = f"{self.base_url}/patients/dashboard/upcoming-appointments?limit={limit}"
        
        response = requests.get(url, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"GET UPCOMING APPOINTMENTS (Dashboard)")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} upcoming appointments")
            for apt in data:
                print(f"\n   Appointment #{apt['id']}")
                print(f"   Doctor: Dr. {apt['doctor']['firstName']} {apt['doctor']['lastName']}")
                print(f"   Date: {apt['startTime']}")
                print(f"   Status: {apt['status']}")
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return []
    
    def get_recent_checkups(self, limit: int = 5) -> list:
        """Get recent checkups for dashboard"""
        url = f"{self.base_url}/patients/dashboard/recent-checkups?limit={limit}"
        
        response = requests.get(url, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"GET RECENT CHECKUPS (Dashboard)")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} recent checkups")
            for checkup in data:
                print(f"\n   Checkup #{checkup['id']}")
                print(f"   Date: {checkup['date']}")
                print(f"   Doctor: Dr. {checkup['doctor']['firstName']} {checkup['doctor']['lastName']}")
                print(f"   Diagnosis: {checkup['diagnosis']}")
                print(f"   Medications: {len(checkup['medications'])}")
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return []
    
    # ============================================================
    # APPOINTMENT SLOT ENDPOINTS
    # ============================================================
    
    def get_all_doctors_with_slots(self) -> list:
        """Get all doctors with available slots"""
        url = f"{self.base_url}/appointment-slots/doctors-with-slots"
        
        response = requests.get(url, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"GET ALL DOCTORS WITH SLOTS")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} doctors")
            for doctor in data[:3]:  # Show first 3
                print(f"\n   Dr. {doctor['firstName']} {doctor['lastName']}")
                print(f"   Specialization: {doctor['specialization']}")
                print(f"   Department: {doctor['departmentName']}")
                print(f"   Available Slots: {doctor['availableSlotsCount']}")
            if len(data) > 3:
                print(f"\n   ... and {len(data) - 3} more doctors")
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return []
    
    def get_doctor_available_slots(self, doctor_id: int) -> Dict[str, Any]:
        """Get available slots for a specific doctor"""
        url = f"{self.base_url}/appointment-slots/doctor/{doctor_id}"
        
        response = requests.get(url, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"GET DOCTOR AVAILABLE SLOTS (Doctor #{doctor_id})")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved slots")
            print(f"   Doctor: Dr. {data['doctor']['firstName']} {data['doctor']['lastName']}")
            print(f"   Specialization: {data['doctor']['specialization']}")
            print(f"   Total Available Slots: {data['totalAvailableSlots']}")
            
            if data['slots']:
                print(f"\n   Next 3 slots:")
                for slot in data['slots'][:3]:
                    print(f"   - Slot #{slot['id']}: {slot['startTime']} to {slot['endTime']}")
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return {}
    
    def get_available_slots_by_department(self, department_id: int) -> list:
        """Get available slots filtered by department"""
        url = f"{self.base_url}/appointment-slots/available?departmentId={department_id}"
        
        response = requests.get(url, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"GET AVAILABLE SLOTS BY DEPARTMENT (#{department_id})")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved slots from {len(data)} doctors")
            for schedule in data[:2]:  # Show first 2
                print(f"\n   Dr. {schedule['doctorName']}")
                print(f"   Specialization: {schedule['specialization']}")
                print(f"   Available Slots: {len(schedule['slots'])}")
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return []
    
    # ============================================================
    # ONLINE APPOINTMENT ENDPOINTS
    # ============================================================
    
    def book_appointment(self, slot_id: int, reason: Optional[str] = None) -> Dict[str, Any]:
        """Book an online appointment"""
        url = f"{self.base_url}/online-appointments/book"
        
        if not self.patient_id:
            self.get_profile()  # Get patient ID first
        
        payload = {
            "patientId": self.patient_id,
            "slotId": slot_id,
            "reason": reason
        }
        
        response = requests.post(url, json=payload, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"BOOK APPOINTMENT")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            print(f"✅ Appointment booked successfully")
            print(f"   Appointment ID: {data.get('id')}")
            print(f"   Doctor: Dr. {data['doctor']['firstName']} {data['doctor']['lastName']}")
            print(f"   Date: {data['startTime']}")
            print(f"   Status: {data['status']}")
            return data
        else:
            print(f"❌ Booking failed: {response.text}")
            return response.json()
    
    def get_my_appointments(self, status: Optional[str] = None, time_filter: Optional[str] = None) -> list:
        """Get my appointments with optional filters"""
        url = f"{self.base_url}/online-appointments/my-appointments"
        params = []
        if status:
            params.append(f"status={status}")
        if time_filter:
            params.append(f"timeFilter={time_filter}")
        
        if params:
            url += "?" + "&".join(params)
        
        response = requests.get(url, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"GET MY APPOINTMENTS")
        if status or time_filter:
            print(f"Filters: status={status}, timeFilter={time_filter}")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} appointments")
            for apt in data:
                print(f"\n   Appointment #{apt['id']}")
                print(f"   Doctor: Dr. {apt['doctor']['firstName']} {apt['doctor']['lastName']}")
                print(f"   Department: {apt['doctor']['departmentName']}")
                print(f"   Date: {apt['startTime']}")
                print(f"   Status: {apt['status']}")
                if apt.get('reason'):
                    print(f"   Reason: {apt['reason']}")
            return data
        else:
            print(f"❌ Failed: {response.text}")
            return []
    
    def cancel_appointment(self, appointment_id: int) -> Dict[str, Any]:
        """Cancel an appointment"""
        url = f"{self.base_url}/online-appointments/{appointment_id}/cancel"
        
        response = requests.patch(url, headers=self._get_headers())
        print(f"\n{'='*60}")
        print(f"CANCEL APPOINTMENT #{appointment_id}")
        print(f"{'='*60}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data.get('message', 'Appointment cancelled')}")
            return data
        else:
            print(f"❌ Cancellation failed: {response.text}")
            return response.json()


def main():
    """Test all patient portal endpoints"""
    print("\n" + "="*60)
    print("PATIENT PORTAL API TEST SUITE")
    print("="*60)
    
    client = PatientPortalClient()
    
    # 1. Login as patient
    print("\n\n1. AUTHENTICATION")
    print("-" * 60)
    patient_email = input("Enter patient email (or press Enter for default): ").strip()
    if not patient_email:
        patient_email = "patient@hospital.com"
    
    patient_password = input("Enter patient password (or press Enter for default): ").strip()
    if not patient_password:
        patient_password = "password123"
    
    client.login(patient_email, patient_password)
    
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
                client.get_my_appointments()
                client.get_my_appointments(time_filter='upcoming')
                
                # 7. Cancel appointment
                if booked and booked.get('id'):
                    print("\n\n7. CANCEL APPOINTMENT")
                    print("-" * 60)
                    cancel_test = input("\nDo you want to test cancellation? (y/n): ").strip().lower()
                    if cancel_test == 'y':
                        client.cancel_appointment(booked['id'])
                        client.get_my_appointments()
    
    print("\n\n" + "="*60)
    print("TEST SUITE COMPLETED")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
