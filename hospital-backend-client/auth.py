import requests

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
        print(response.json())

        self.token = response.json().get("access_token")
        return self.token

    def register_user(self, payload: dict):
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print(f"[REGISTER] {payload['email']}: {response.status_code}")
        print(response.json())


class UserClient:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def get_profile(self):
        response = requests.get(f"{BASE_URL}/users/me", headers=self.headers)
        print(f"[PROFILE] Status: {response.status_code}")
        print(response.json())

    def update_patient_profile(self, patient_data: dict):
        """
        Update patient profile with the given data.
        
        Args:
            patient_data: Dictionary containing any of these optional fields:
                - dateOfBirth (str): ISO format date
                - bloodGroup (str): Blood group
                - medicalHistory (str): Medical history text
                - familyHistory (str): Family history text
                - allergies (str): Allergies text
                - address (str): Address text
                - phoneNumber (str): Phone number
                - emergencyContact (str): Emergency contact number
        """
        response = requests.put(
            f"{BASE_URL}/users/me/patient-profile",
            headers=self.headers,
            json=patient_data
        )
        print(f"[UPDATE PATIENT PROFILE] Status: {response.status_code}")
        print(response.json())


def main():
    #Register a user (uncomment to test registration)
    user_payload = {
        "firstName": "Zohaib",
        "lastName": "Test",
        "email": "zohaib@example.com",
        "password": "StrongPassword123",
        "cnic": "1234512345671",
        "gender": "MALE"
    }
    # AuthClient().register_user(user_payload)

    # Regular user
    user_auth = AuthClient()
    user_token = user_auth.login("zohaib@example.com", "StrongPassword123")
    # user_token = user_auth.login("farhan.khan@gmail.com", "12345678")
    user_client = UserClient(user_token)
    user_client.get_profile()

    # Example: Update patient profile
    patient_data = {
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "bloodGroup": "A+",
        "medicalHistory": "No major illnesses",
        "familyHistory": "No hereditary conditions",
        "allergies": "None",
        "address": "123 main St, City",
        "phoneNumber": "+1234567890",
        "emergencyContact": "+0987654321"
    }
    user_client.update_patient_profile(patient_data)

    # Admin user
    # admin_auth = AuthClient()
    # admin_token = admin_auth.login("admin@hospital.com", "admin123456")
    # admin_client = UserClient(admin_token)
    # admin_client.get_profile()

#     [LOGIN] admin@hospital.com: 200
# {'access_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AaG9zcGl0YWwuY29tIiwiaWF0IjoxNzU3NzU2MjMzLCJleHAiOjE3NTc3NTk4MzN9.ajLCumIdh3ik8D287ZOVnY9UDHXwDxlE-nu_LvQsr7A'}
# [PROFILE] Status: 200
# {'id': 1, 'email': 'admin@hospital.com', 'firstName': 'Hospital', 'lastName': 'Administrator', 'gender': 'MALE', 'cnic': '1234567890123', 'createdAt': '2025-09-13T09:31:59.273Z', 'registeredAt': '2025-09-13T09:31:59.273Z', 'isActive': True, 'roles': ['ADMIN']}

if __name__ == "__main__":
    main()

# PS E:\FYP - Source Code> python -u "e:\FYP - Source Code\hospital-backend-client\auth.py"
# [REGISTER] zohaib@example.com: 403
# {'message': 'Credentials taken', 'error': 'Forbidden', 'statusCode': 403}
# [LOGIN] zohaib@example.com: 200
# {'access_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoiem9oYWliQGV4YW1wbGUuY29tIiwiaWF0IjoxNzU4OTY5Mzg0LCJleHAiOjE3NTg5NzI5ODR9.b-mswkWtFx_e4bCV4fBgcMG9TTEbPmUJnaYlcJ3BDuQ'}
# [PROFILE] Status: 200
# {'id': 2, 'email': 'zohaib@example.com', 'firstName': 'Zohaib', 'lastName': 'Test', 'gender': 'MALE', 'cnic': '1234512345671', 'createdAt': '2025-09-27T10:24:21.722Z', 'registeredAt': '2025-09-27T10:24:21.722Z', 'isActive': True, 'roles': ['PATIENT'], 'patient': {'id': 1, 'dateOfBirth': None, 'bloodGroup': '', 'address': '', 'phoneNumber': '', 'emergencyContact': '', 'medicalHistory': '', 'familyHistory': '', 'allergies': '', 'onboardingDone': False}}
# PS E:\FYP - Source Code> python -u "e:\FYP - Source Code\hospital-backend-client\auth.py"
# [LOGIN] zohaib@example.com: 200
# {'access_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoiem9oYWliQGV4YW1wbGUuY29tIiwiaWF0IjoxNzU4OTY5ODA0LCJleHAiOjE3NTg5NzM0MDR9.ppYBNPoE1izINwxjc1JlUmXxLIBTgnmxm0tkUhpumFo'}
# [PROFILE] Status: 200
# {'id': 2, 'email': 'zohaib@example.com', 'firstName': 'Zohaib', 'lastName': 'Test', 'gender': 'MALE', 'cnic': '1234512345671', 'createdAt': '2025-09-27T10:24:21.722Z', 'registeredAt': '2025-09-27T10:24:21.722Z', 'isActive': True, 'roles': ['PATIENT'], 'patient': {'id': 1, 'dateOfBirth': None, 'bloodGroup': '', 'address': '', 'phoneNumber': '', 'emergencyContact': '', 'medicalHistory': '', 'familyHistory': '', 'allergies': '', 'onboardingDone': False}}
# [UPDATE PATIENT PROFILE] Status: 200
# {'id': 1, 'userId': 2, 'dateOfBirth': '1990-01-01T00:00:00.000Z', 'bloodGroup': 'A+', 'medicalHistory': 'No major illnesses', 'familyHistory': 'No hereditary conditions', 'allergies': 'None', 'address': '123 Main St, City', 'phoneNumber': '+1234567890', 'emergencyContact': '+0987654321', 'onboardingDone': False, 'createdBy': 2}
# PS E:\FYP - Source Code> python -u "e:\FYP - Source Code\hospital-backend-client\auth.py"
# [LOGIN] zohaib@example.com: 200
# {'access_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoiem9oYWliQGV4YW1wbGUuY29tIiwiaWF0IjoxNzU4OTY5ODYzLCJleHAiOjE3NTg5NzM0NjN9.UfsL8EOEvjMnnEVw3ntUesZzz2uT-hXWTsGyicC5vRM'}
# [PROFILE] Status: 200
# {'id': 2, 'email': 'zohaib@example.com', 'firstName': 'Zohaib', 'lastName': 'Test', 'gender': 'MALE', 'cnic': '1234512345671', 'createdAt': '2025-09-27T10:24:21.722Z', 'registeredAt': '2025-09-27T10:24:21.722Z', 'isActive': True, 'roles': ['PATIENT'], 'patient': {'id': 1, 'dateOfBirth': '1990-01-01T00:00:00.000Z', 'bloodGroup': 'A+', 'address': '123 Main St, City', 'phoneNumber': '+1234567890', 'emergencyContact': '+0987654321', 'medicalHistory': 'No major illnesses', 'familyHistory': 'No hereditary conditions', 'allergies': 'None', 'onboardingDone': False}}
# [UPDATE PATIENT PROFILE] Status: 200
# {'id': 1, 'userId': 2, 'dateOfBirth': '1990-01-01T00:00:00.000Z', 'bloodGroup': 'A+', 'medicalHistory': 'No major illnesses', 'familyHistory': 'No hereditary conditions', 'allergies': 'None', 'address': '123 main St, City', 'phoneNumber': '+1234567890', 'emergencyContact': '+0987654321', 'onboardingDone': True, 'createdBy': 2}