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

class DepartmentClient:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def register_department(self, payload: dict = None):
        response = requests.post(
            f"{BASE_URL}/departments/register",
            json=payload or {},
            headers=self.headers
        )
        print(f"[REGISTER DEPARTMENT] Status: {response.status_code}")
        print(response.json())

    def update_department(self, dept_id: int, payload: dict = None):
        response = requests.patch(
            f"{BASE_URL}/departments/{dept_id}",
            json=payload or {},
            headers=self.headers
        )
        print(f"[UPDATE DEPARTMENT] Status: {response.status_code}")
        print(response.json())

    def get_all_departments(self):
        response = requests.get(f"{BASE_URL}/departments", headers=self.headers)
        print(f"[GET ALL DEPARTMENTS] Status: {response.status_code}")
        print(response.json())


def main():
 
    # Admin user
    admin_auth = AuthClient()
    admin_token = admin_auth.login("admin@hospital.com", "admin123456")

    # Department actions by admin
    dept_client = DepartmentClient(admin_token)  # Use admin token if needed
    dept_client.register_department({ "name": "Cardiology", "description": "Heart-related treatments", "code": "CARD" })  # You can pass actual payload if needed
    dept_client.update_department(dept_id=1, payload={ "description": "Heart-related treatments (updated)" })  # Replace with actual ID
    dept_client.get_all_departments()


if __name__ == "__main__":
    main()
