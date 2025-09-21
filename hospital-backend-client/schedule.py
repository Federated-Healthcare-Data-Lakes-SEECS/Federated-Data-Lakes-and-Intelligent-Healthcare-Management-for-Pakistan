import requests

BASE_URL = 'http://localhost:3000'


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
        print(response.json())

        self.token = response.json().get("access_token")
        return self.token


class ScheduleClient:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def create_schedule(self, payload: dict):
        response = requests.post(
            f"{BASE_URL}/doctorschedules",
            json=payload,
            headers=self.headers
        )
        print(f"[CREATE SCHEDULE] Status: {response.status_code}")
        print(response.json())
        return response
    
    def get_schedule_by_id(self, schedule_id: int):
        response = requests.get(f"{BASE_URL}/doctorschedules/{schedule_id}", headers=self.headers)
        print(f"[GET SCHEDULE BY ID] ID {schedule_id}: {response.status_code}")
        print(response.json())
        return response
    
    def get_all_schedules(self):
        response = requests.get(f"{BASE_URL}/doctorschedules", headers=self.headers)
        print(f"[GET ALL SCHEDULES] Status: {response.status_code}")
        print(response.json())
        return response
    
    def delete_schedule(self, schedule_id: int):
        response = requests.delete(f"{BASE_URL}/doctorschedules/{schedule_id}/delete", headers=self.headers)
        print(f"[DELETE SCHEDULE] ID {schedule_id}: {response.status_code}")
        print(response.json())
        return response

if __name__ == "__main__":
    # Admin user
    admin_auth = AuthClient()
    admin_token = admin_auth.login("ahmad.khan@hospital.com", "12345678")

    # Schedule actions by admin
    schedule_client = ScheduleClient(admin_token)

    from datetime import datetime, timezone

    print ("from: ", datetime(2023, 10, 1, 9, 0, 0, tzinfo=timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"))
    schedule_client.create_schedule({
        "from": datetime(2023, 10, 1, 9, 0, 0, tzinfo=timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "to": datetime(2023, 10, 1, 11, 0, 0, tzinfo=timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "noOfSlots": 10,
    })

    schedule_client.get_all_schedules()

    # schedule_client.get_schedule_by_id(1)  # Replace with actual ID

