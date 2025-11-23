"""
Setup script to create a test patient for the patient portal API tests
"""
import requests

BASE_URL = "http://localhost:3002"

def login_as_admin():
    """Login as admin to get token"""
    print("\n=== Logging in as Admin ===")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "admin@hospital.com",
            "password": "admin123456"
        }
    )
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Admin login successful")
        return token
    else:
        print(f"❌ Admin login failed: {response.text}")
        return None

def create_patient(admin_token):
    """Create a test patient"""
    print("\n=== Creating Test Patient ===")
    response = requests.post(
        f"{BASE_URL}/patients/register",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "firstName": "Ahmed",
            "lastName": "Khan",
            "email": "patient@hospital.com",
            "cnic": "42101-1234567-1",
            "gender": "MALE",
            "dateOfBirth": "1990-05-15",
            "phoneNumber": "+92-300-1234567",
            "address": "House 123, Street 5, F-7, Islamabad",
            "bloodGroup": "B+",
            "emergencyContact": "+92-301-7654321"
        }
    )
    
    if response.status_code == 201:
        patient = response.json()
        print(f"✅ Patient created successfully")
        print(f"   ID: {patient.get('id')}")
        print(f"   Email: {patient.get('email')}")
        print(f"   Default password: password123")
        return patient
    else:
        print(f"❌ Patient creation failed: {response.text}")
        return None

def verify_patient_login():
    """Verify the patient can login"""
    print("\n=== Verifying Patient Login ===")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "patient@hospital.com",
            "password": "password123"
        }
    )
    
    if response.status_code == 200:
        print("✅ Patient can login successfully")
        return True
    else:
        print(f"❌ Patient login failed: {response.text}")
        return False

def create_doctor_schedule(admin_token):
    """Create a schedule for the default doctor so we have slots to book"""
    print("\n=== Creating Doctor Schedule ===")
    
    # First login as doctor
    doctor_login = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "doctor@hospital.com",
            "password": "password123"
        }
    )
    
    if doctor_login.status_code != 200:
        print(f"❌ Doctor login failed: {doctor_login.text}")
        return False
    
    doctor_token = doctor_login.json()["access_token"]
    
    # Create schedule for next week
    response = requests.post(
        f"{BASE_URL}/doctorschedules",
        headers={"Authorization": f"Bearer {doctor_token}"},
        json={
            "from": "2025-11-25T09:00:00.000Z",
            "to": "2025-11-25T17:00:00.000Z",
            "noOfSlots": 16
        }
    )
    
    if response.status_code == 201:
        schedule = response.json()
        print(f"✅ Doctor schedule created successfully")
        print(f"   Schedule ID: {schedule.get('id')}")
        print(f"   Date: 2025-11-25")
        print(f"   Slots: 16 (09:00 AM - 05:00 PM)")
        return True
    else:
        print(f"❌ Schedule creation failed: {response.text}")
        return False

def main():
    print("="*60)
    print("PATIENT PORTAL TEST DATA SETUP")
    print("="*60)
    
    # Step 1: Login as admin
    admin_token = login_as_admin()
    if not admin_token:
        print("\n❌ Setup failed: Could not login as admin")
        return
    
    # Step 2: Create patient
    patient = create_patient(admin_token)
    if not patient:
        print("\n⚠️  Patient might already exist, continuing...")
    
    # Step 3: Verify patient login
    can_login = verify_patient_login()
    if not can_login:
        print("\n❌ Setup failed: Patient cannot login")
        return
    
    # Step 4: Create doctor schedule with slots
    schedule_created = create_doctor_schedule(admin_token)
    if not schedule_created:
        print("\n⚠️  Schedule creation failed, but continuing...")
    
    print("\n" + "="*60)
    print("✅ SETUP COMPLETE!")
    print("="*60)
    print("\nTest Patient Credentials:")
    print("  Email: patient@hospital.com")
    print("  Password: password123")
    print("\nYou can now run: python patient_portal_test.py")
    print("="*60)

if __name__ == "__main__":
    main()
