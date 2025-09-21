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

class ReceptionistClient:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def register_receptionist(self, payload: dict):
        response = requests.post(
            f"{BASE_URL}/receptionists/register",
            json=payload,
            headers=self.headers
        )
        print(f"[REGISTER RECEPTIONIST] {payload.get('email', 'N/A')}: {response.status_code}")
        print(response.json())
        return response

    def update_receptionist(self, receptionist_id: int, payload: dict = None):
        response = requests.patch(
            f"{BASE_URL}/receptionists/{receptionist_id}",
            json=payload or {},
            headers=self.headers
        )
        print(f"[UPDATE RECEPTIONIST] ID {receptionist_id}: {response.status_code}")
        print(response.json())
        return response

    def get_all_receptionists(self):
        response = requests.get(f"{BASE_URL}/receptionists", headers=self.headers)
        print(f"[GET ALL RECEPTIONISTS] Status: {response.status_code}")
        print(response.json())
        return response

    def get_receptionist_by_id(self, receptionist_id: int):
        response = requests.get(f"{BASE_URL}/receptionists/{receptionist_id}", headers=self.headers)
        print(f"[GET RECEPTIONIST BY ID] ID {receptionist_id}: {response.status_code}")
        print(response.json())
        return response

    def delete_receptionist(self, receptionist_id: int):
        response = requests.delete(f"{BASE_URL}/receptionists/{receptionist_id}", headers=self.headers)
        print(f"[DELETE RECEPTIONIST] ID {receptionist_id}: {response.status_code}")
        print(response.json())
        return response


def main():
    
    # Admin user
    admin_auth = AuthClient()
    admin_token = admin_auth.login("admin@hospital.com", "admin123456")

    # Receptionist management actions by admin
    receptionist_client = ReceptionistClient(admin_token)

    # Register a new receptionist
    receptionist_payload = {
        # User Info
        "firstName": "Sara",
        "lastName": "Khan",
        "email": "sara.khan@hospital.com",
        "gender": "FEMALE",
        "cnic": "1234567890123",

        # Receptionist Info
    }
    receptionist_client.register_receptionist(receptionist_payload)

    receptionist_id = receptionist_client.get_all_receptionists().json()[0].get("id")

    # Get all receptionists
    receptionist_client.get_all_receptionists()

    receptionist_client.get_receptionist_by_id(receptionist_id)

    # Update receptionist information
    update_payload = {
        "phoneNumber": "123-456-7890",
    }
    receptionist_client.update_receptionist(receptionist_id=receptionist_id, payload=update_payload)

    receptionist_client.delete_receptionist(receptionist_id=receptionist_id)


    print("\n=== Receptionist Management Tests Completed ===")


if __name__ == "__main__":
    main()