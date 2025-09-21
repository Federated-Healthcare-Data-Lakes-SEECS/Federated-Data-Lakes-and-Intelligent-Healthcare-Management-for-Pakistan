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

class LabTestTemplateClient:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def register_labtesttemplate(self, payload: dict = None):
        response = requests.post(
            f"{BASE_URL}/labtesttemplate",
            json=payload or {},
            headers=self.headers
        )
        print(f"[REGISTER LABTEST TEMPLATE] Status: {response.status_code}")
        print(response.json())

    def update_labtesttemplate(self, template_id: int, payload: dict = None):
        response = requests.put(
            f"{BASE_URL}/labtesttemplate/{template_id}",
            json=payload or {},
            headers=self.headers
        )
        print(f"[UPDATE LABTEST TEMPLATE] Status: {response.status_code}")
        print(response.json())

    def get_all_labtesttemplates(self):
        response = requests.get(f"{BASE_URL}/labtesttemplate", headers=self.headers)
        print(f"[GET ALL LABTEST TEMPLATES] Status: {response.status_code}")
        print(response.json())

    def get_labtesttemplate_by_id(self, template_id: int):
        response = requests.get(f"{BASE_URL}/labtesttemplate/{template_id}", headers=self.headers)
        print(f"[GET LABTEST TEMPLATE BY ID] Status: {response.status_code}")
        print(response.json())

    def deactivate_labtesttemplate(self, template_id: int):
        response = requests.patch(
            f"{BASE_URL}/labtesttemplate/{template_id}/deactivate",
            headers=self.headers
        )
        print(f"[DEACTIVATE LABTEST TEMPLATE] Status: {response.status_code}")
        print(response.json())

def main():
    # Admin user
    admin_auth = AuthClient()
    admin_token = admin_auth.login("admin@hospital.com", "admin123456")

    # LabTestTemplate actions by admin
    template_client = LabTestTemplateClient(admin_token)
    # template_client.register_labtesttemplate({
    #     "name": "CBC",
    #     "description": "Complete Blood Count",
    #     "version": "v1",
    #     "formStructure": "{}",  # Replace with actual JSON structure if needed
    #     "isActive": False
    # })
    template_client.update_labtesttemplate(template_id=1, payload={
        "description": "Complete Blood Count (updated)",
        "version": "v2",
        "isActive": True,
    })  # Replace with actual ID
    template_client.get_all_labtesttemplates()
    template_client.get_labtesttemplate_by_id(template_id=1)  # Replace with actual ID
    # template_client.deactivate_labtesttemplate(template_id=1)  # Replace with actual ID

if __name__ == "__main__":
    main()


# [GET ALL LABTEST TEMPLATES] Status: 200
# [{'id': 1, 'name': 'CBC', 'description': 'Complete Blood Count (updated)', 'version': 'v2', 'formStructure': '{}', 'isActive': False, 'createdAt': '2025-09-21T06:44:33.486Z', 'updatedAt': '2025-09-21T07:24:01.713Z'}]
# [DEACTIVATE LABTEST TEMPLATE] Status: 200
# {'id': 1, 'name': 'CBC', 'description': 'Complete Blood Count (updated)', 'version': 'v2', 'formStructure': '{}', 'isActive': False, 'createdAt': '2025-09-21T06:44:33.486Z', 'updatedAt': '2025-09-21T07:24:01.737Z'}

# [GET LABTEST TEMPLATE BY ID] Status: 200
# {'id': 1, 'name': 'CBC', 'description': 'Complete Blood Count (updated)', 'version': 'v2', 'formStructure': '{}', 'isActive': True, 'createdAt': '2025-09-21T06:44:33.486Z', 'updatedAt': '2025-09-21T07:29:42.008Z'}