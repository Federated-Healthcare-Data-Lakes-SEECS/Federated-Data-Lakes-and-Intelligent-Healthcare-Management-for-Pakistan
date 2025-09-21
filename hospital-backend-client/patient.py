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

class PatientClient:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def register_patient(self, payload: dict):
        response = requests.post(
            f"{BASE_URL}/patients/register",
            json=payload,
            headers=self.headers
        )
        print(f"[REGISTER PATIENT] {payload.get('email', 'N/A')}: {response.status_code}")
        print(response.json())
        return response

    def get_all_patients(self):
        response = requests.get(f"{BASE_URL}/patients", headers=self.headers)
        print(f"[GET ALL PATIENTS] Status: {response.status_code}")
        print(response.json())
        return response


def main():
    
    # Admin user
    admin_auth = AuthClient()
    admin_token = admin_auth.login("admin@hospital.com", "admin123456")

    # Receptionist User

    # receptionist_auth = AuthClient()
    # receptionist_token = receptionist_auth.login()
    
    # Patient management actions by admin
    patient_client = PatientClient(admin_token)

    # Register a new patient
    patient_payload = {
        # User Info
        "firstName": "Farhan",
        "lastName": "Khan",
        "email": "farhan.khan@gmail.com",
        "gender": "MALE",
        "cnic": "123456789123456",
    }
    patient_client.register_patient(patient_payload)

    # Get all patients
    patient_client.get_all_patients()

    print("\n=== Patient Management Tests Completed ===")


if __name__ == "__main__":
    main()