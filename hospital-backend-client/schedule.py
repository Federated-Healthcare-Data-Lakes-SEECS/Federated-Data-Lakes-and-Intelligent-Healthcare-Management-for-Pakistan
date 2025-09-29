import requests
from datetime import datetime, timezone
import json

BASE_URL = 'http://localhost:3002'


class AuthClient:
    def __init__(self):
        self.token = None

    def login(self, email: str, password: str) -> str:
        payload = {
            "email": email,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        print(f"[LOGIN] {email}: {response.status_code}")
        if response.status_code == 200:
            print(response.json())
            self.token = response.json().get("access_token")
        else:
            print(f"Login failed: {response.text}")
        return self.token


class ScheduleClient:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def create_schedule(self, payload: dict):
        """Create a new doctor schedule"""
        response = requests.post(
            f"{BASE_URL}/doctorschedules",
            json=payload,
            headers=self.headers
        )
        print(f"[CREATE SCHEDULE] Status: {response.status_code}")
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"Created schedule ID: {result.get('id', 'N/A')}")
            print(json.dumps(result, indent=2, default=str))
        else:
            print(f"Error: {response.text}")
        return response
    
    def get_schedule_by_id(self, schedule_id: int):
        """Get a specific schedule by ID"""
        response = requests.get(f"{BASE_URL}/doctorschedules/{schedule_id}", headers=self.headers)
        print(f"[GET SCHEDULE BY ID] ID {schedule_id}: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Schedule details:")
            print(json.dumps(result, indent=2, default=str))
        else:
            print(f"Error: {response.text}")
        return response
    
    def get_all_schedules(self):
        """Get all schedules for the current doctor"""
        response = requests.get(f"{BASE_URL}/doctorschedules", headers=self.headers)
        print(f"[GET ALL SCHEDULES] Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Found {len(result)} schedules:")
            for schedule in result:
                print(f"  - ID: {schedule.get('id')}, From: {schedule.get('from')}, To: {schedule.get('to')}, Slots: {schedule.get('noOfSlots')}")
        else:
            print(f"Error: {response.text}")
        return response
    
    def delete_schedule(self, schedule_id: int):
        """Delete a schedule by ID"""
        response = requests.delete(f"{BASE_URL}/doctorschedules/{schedule_id}", headers=self.headers)
        print(f"[DELETE SCHEDULE] ID {schedule_id}: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Delete result: {result.get('message', 'Success')}")
        else:
            print(f"Error: {response.text}")
        return response


def test_schedule_apis():
    """Comprehensive test of all schedule APIs"""
    print("=" * 60)
    print("TESTING DOCTOR SCHEDULE APIS")
    print("=" * 60)
    
    # Login as doctor
    print("\n1. LOGGING IN AS DOCTOR...")
    admin_auth = AuthClient()
    admin_token = admin_auth.login("zaid@doctor.com", "12345678")
    
    if not admin_token:
        print("❌ Login failed! Cannot proceed with tests.")
        return
    
    schedule_client = ScheduleClient(admin_token)
    
    # Test 1: Create a schedule
    print("\n2. CREATING A NEW SCHEDULE...")
    schedule_payload = {
        "from": datetime(2025, 12, 1, 9, 0, 0, tzinfo=timezone.utc).isoformat(),
        "to": datetime(2025, 12, 1, 17, 0, 0, tzinfo=timezone.utc).isoformat(),
        "noOfSlots": 8,  # 8 slots = 1 hour each
    }
    print(f"Schedule payload: {json.dumps(schedule_payload, indent=2)}")
    create_response = schedule_client.create_schedule(schedule_payload)
    
    created_schedule_id = None
    if create_response.status_code in [200, 201]:
        created_schedule_id = create_response.json().get('id')
        print(f"✅ Schedule created successfully with ID: {created_schedule_id}")
    else:
        print("❌ Schedule creation failed!")
    
    # Test 2: Get all schedules
    print("\n3. GETTING ALL DOCTOR SCHEDULES...")
    schedule_client.get_all_schedules()
    
    # Test 3: Get specific schedule (if we created one)
    if created_schedule_id:
        print(f"\n4. GETTING SCHEDULE BY ID ({created_schedule_id})...")
        schedule_client.get_schedule_by_id(created_schedule_id)
    
    # Test 4: Try to create overlapping schedule (should fail)
    print("\n5. TESTING OVERLAPPING SCHEDULE (should fail)...")
    overlapping_payload = {
        "from": datetime(2025, 12, 1, 10, 0, 0, tzinfo=timezone.utc).isoformat(),
        "to": datetime(2025, 12, 1, 12, 0, 0, tzinfo=timezone.utc).isoformat(),
        "noOfSlots": 4,
    }
    overlap_response = schedule_client.create_schedule(overlapping_payload)
    if overlap_response.status_code != 200:
        print("✅ Overlapping schedule correctly rejected!")
    
    # Test 5: Create another valid schedule
    print("\n6. CREATING ANOTHER VALID SCHEDULE...")
    second_payload = {
        "from": datetime(2025, 12, 2, 9, 0, 0, tzinfo=timezone.utc).isoformat(),
        "to": datetime(2025, 12, 2, 13, 0, 0, tzinfo=timezone.utc).isoformat(),
        "noOfSlots": 4,
    }
    second_response = schedule_client.create_schedule(second_payload)
    second_schedule_id = None
    if second_response.status_code in [200, 201]:
        second_schedule_id = second_response.json().get('id')
        print(f"✅ Second schedule created with ID: {second_schedule_id}")
    
    # Test 6: Delete a schedule
    if created_schedule_id:
        print(f"\n7. DELETING SCHEDULE ({created_schedule_id})...")
        schedule_client.delete_schedule(created_schedule_id)
    
    # Test 7: Verify deletion by getting all schedules again
    print("\n8. VERIFYING DELETION - GETTING ALL SCHEDULES AGAIN...")
    schedule_client.get_all_schedules()
    
    # Test 8: Try invalid operations
    print("\n9. TESTING ERROR CASES...")
    print("9a. Getting non-existent schedule...")
    schedule_client.get_schedule_by_id(99999)
    
    print("9b. Deleting non-existent schedule...")
    schedule_client.delete_schedule(99999)
    
    print("9c. Creating schedule with invalid data...")
    invalid_payload = {
        "from": datetime(2025, 12, 3, 17, 0, 0, tzinfo=timezone.utc).isoformat(),
        "to": datetime(2025, 12, 3, 9, 0, 0, tzinfo=timezone.utc).isoformat(),  # to before from
        "noOfSlots": 5,
    }
    schedule_client.create_schedule(invalid_payload)
    
    print("\n" + "=" * 60)
    print("SCHEDULE API TESTING COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    test_schedule_apis()

