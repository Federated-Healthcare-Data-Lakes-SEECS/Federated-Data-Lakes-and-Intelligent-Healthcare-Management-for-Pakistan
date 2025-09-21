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

class DoctorClient:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def register_doctor(self, payload: dict):
        response = requests.post(
            f"{BASE_URL}/doctors/register",
            json=payload,
            headers=self.headers
        )
        print(f"[REGISTER DOCTOR] {payload.get('email', 'N/A')}: {response.status_code}")
        print(response.json())
        return response

    def update_doctor(self, doctor_id: int, payload: dict = None):
        response = requests.patch(
            f"{BASE_URL}/doctors/{doctor_id}",
            json=payload or {},
            headers=self.headers
        )
        print(f"[UPDATE DOCTOR] ID {doctor_id}: {response.status_code}")
        print(response.json())
        return response

    def get_all_doctors(self):
        response = requests.get(f"{BASE_URL}/doctors", headers=self.headers)
        print(f"[GET ALL DOCTORS] Status: {response.status_code}")
        print(response.json())
        return response

    def get_doctor_by_id(self, doctor_id: int):
        response = requests.get(f"{BASE_URL}/doctors/{doctor_id}", headers=self.headers)
        print(f"[GET DOCTOR BY ID] ID {doctor_id}: {response.status_code}")
        print(response.json())
        return response

    def get_doctors_by_department(self, department_name: str):
        response = requests.get(
            f"{BASE_URL}/doctors/department/{department_name}",
            headers=self.headers
        )
        print(f"[GET DOCTORS BY DEPARTMENT] {department_name}: {response.status_code}")
        print(response.json())
        return response

    def delete_doctor(self, doctor_id: int):
        response = requests.delete(f"{BASE_URL}/doctors/{doctor_id}", headers=self.headers)
        print(f"[DELETE DOCTOR] ID {doctor_id}: {response.status_code}")
        print(response.json())
        return response


def main():
    
    # Admin user
    admin_auth = AuthClient()
    admin_token = admin_auth.login("admin@hospital.com", "admin123456")

    # Doctor management actions by admin
    doctor_client = DoctorClient(admin_token)
    
    # Register a new doctor
    doctor_payload = {
        # User Info
        "firstName": "Ahmad",
        "lastName": "Khan",
        "email": "ahmad.khan@hospital.com",
        "gender": "MALE",
        "cnic": "1234567890124",
        
        # Doctor Info
        "licenseNumber": "DOC123456",
        "specialization": "Cardiology",
        "experience": 5,
        "qualification": "MBBS, MD Cardiology",
        
        # Department Info
        "departmentName": "Cardiology"
    }
    doctor_client.register_doctor(doctor_payload)

    # doctor_id = doctor_client.get_all_doctors().json()[0].get("id")

    # Get all doctors
    doctor_client.get_all_doctors()

    # doctor_client.get_doctor_by_id(doctor_id)

    # Get doctors by department
    # doctor_client.get_doctors_by_department("Cardiology")

    # Update doctor information
    update_payload = {
        "experience": 6,
        "qualification": "MBBS, MD Cardiology, Fellowship in Interventional Cardiology"
    }
    # doctor_client.update_doctor(doctor_id=doctor_id, payload=update_payload)

    # doctor_client.delete_doctor(doctor_id=doctor_id)


    print("\n=== Doctor Management Tests Completed ===")


if __name__ == "__main__":
    main()