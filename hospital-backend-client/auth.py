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


def main():
    #Register a user (uncomment to test registration)
    # user_payload = {
    #     "firstName": "Zohaib",
    #     "lastName": "Test",
    #     "email": "zohaib@example.com",
    #     "password": "StrongPassword123",
    #     "cnic": "1234512345671",
    #     "gender": "MALE"
    # }
    # AuthClient().register_user(user_payload)

    # Regular user
    # user_auth = AuthClient()
    # # user_token = user_auth.login("zohaib@example.com", "StrongPassword123")
    # user_token = user_auth.login("farhan.khan@gmail.com", "12345678")
    # user_client = UserClient(user_token)
    # user_client.get_profile()

    # Admin user
    admin_auth = AuthClient()
    admin_token = admin_auth.login("admin@hospital.com", "admin123456")
    admin_client = UserClient(admin_token)
    admin_client.get_profile()

#     [LOGIN] admin@hospital.com: 200
# {'access_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AaG9zcGl0YWwuY29tIiwiaWF0IjoxNzU3NzU2MjMzLCJleHAiOjE3NTc3NTk4MzN9.ajLCumIdh3ik8D287ZOVnY9UDHXwDxlE-nu_LvQsr7A'}
# [PROFILE] Status: 200
# {'id': 1, 'email': 'admin@hospital.com', 'firstName': 'Hospital', 'lastName': 'Administrator', 'gender': 'MALE', 'cnic': '1234567890123', 'createdAt': '2025-09-13T09:31:59.273Z', 'registeredAt': '2025-09-13T09:31:59.273Z', 'isActive': True, 'roles': ['ADMIN']}

if __name__ == "__main__":
    main()
