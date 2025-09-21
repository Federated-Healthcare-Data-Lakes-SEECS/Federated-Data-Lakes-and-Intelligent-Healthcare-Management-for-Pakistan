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

class LabTestClient:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def register_labtest(self, payload: dict):
        response = requests.post(
            f"{BASE_URL}/lab-tests/register",
            json=payload,
            headers=self.headers
        )
        print(f"[REGISTER LABTEST] {payload.get('name', 'N/A')}: {response.status_code}")
        print(response.json())
        return response

    def update_labtest(self, labtest_id: int, payload: dict):
        response = requests.patch(
            f"{BASE_URL}/lab-tests/{labtest_id}",
            json=payload,
            headers=self.headers
        )
        print(f"[UPDATE LABTEST] ID {labtest_id}: {response.status_code}")
        print(response.json())
        return response

    def get_all_labtests(self):
        response = requests.get(f"{BASE_URL}/lab-tests", headers=self.headers)
        print(f"[GET ALL LABTESTS] Status: {response.status_code}")
        print(response.json())
        return response

    def get_labtest_by_id(self, labtest_id: int):
        response = requests.get(f"{BASE_URL}/lab-tests/{labtest_id}", headers=self.headers)
        print(f"[GET LABTEST BY ID] ID {labtest_id}: {response.status_code}")
        print(response.json())
        return response

    def get_labtests_by_department(self, department_name: str):
        response = requests.get(
            f"{BASE_URL}/lab-tests/department/{department_name}",
            headers=self.headers
        )
        print(f"[GET LABTESTS BY DEPARTMENT] {department_name}: {response.status_code}")
        print(response.json())
        return response

    def deactivate_labtest(self, labtest_id: int):
        response = requests.patch(
            f"{BASE_URL}/lab-tests/{labtest_id}/deactivate",
            headers=self.headers
        )
        print(f"[DEACTIVATE LABTEST] ID {labtest_id}: {response.status_code}")
        print(response.json())
        return response
    
    def get_templates(self):
        response = requests.get(f"{BASE_URL}/labtesttemplate", headers=self.headers)
        print(f"[GET ALL TEMPLATES] Status: {response.status_code}")
        print(response.json())
        return response

def main():
    # Admin user
    admin_auth = AuthClient()
    admin_token = admin_auth.login("admin@hospital.com", "admin123456")

    # LabTest management actions by admin
    labtest_client = LabTestClient(admin_token)

    # Register a new lab test
    labtest_payload = {
        "name": "Blood Glucose",
        "description": "Blood glucose measurement",
        "departmentName": "Pathology",
        "templateId": 1  # Replace with actual template ID
    }
    labtest_client.register_labtest(labtest_payload)

    # Get all lab tests
    labtest_client.get_all_labtests()

    # Get lab test by ID
    labtest_id = 1  # Replace with actual ID
    labtest_client.get_labtest_by_id(labtest_id)

    # Get lab tests by department
    labtest_client.get_labtests_by_department("Pathology")

    # Update lab test (pass all fields, even if not updating all)
    update_payload = {
        "name": "Blood Glucose Updated",
        "description": "Updated description",
        "templateId": 1  # Replace with actual template ID
    }
    labtest_client.update_labtest(labtest_id, update_payload)

    # Deactivate lab test
    labtest_client.deactivate_labtest(labtest_id)

    # Get all templates
    labtest_client.get_templates()

    print("\n=== LabTest Management Tests Completed ===")

if __name__ == "__main__":
    main()

# [REGISTER LABTEST] Blood Glucose: 201
# {'id': 2, 'name': 'Blood Glucose', 'description': 'Blood glucose measurement', 'departmentName': 'Pathology', 'templateName': 'CBC', 'isActive': True, 'createdAt': '2025-09-21T08:31:59.046Z', 'updatedAt': '2025-09-21T08:31:59.046Z'}
# [GET ALL LABTESTS] Status: 200
# [{'id': 1, 'name': 'Blood Glucose Updated', 'description': 'Updated description', 'departmentName': 'Pathology', 'templateName': 'CBC', 'isActive': False, 'createdAt': '2025-09-21T08:03:50.536Z', 'updatedAt': '2025-09-21T08:03:50.662Z'}, {'id': 2, 'name': 'Blood Glucose', 'description': 'Blood glucose measurement', 'departmentName': 'Pathology', 'templateName': 'CBC', 'isActive': True, 'createdAt': '2025-09-21T08:31:59.046Z', 'updatedAt': '2025-09-21T08:31:59.046Z'}]
# [GET LABTEST BY ID] ID 1: 200
# {'id': 1, 'name': 'Blood Glucose Updated', 'description': 'Updated description', 'departmentName': 'Pathology', 'templateName': 'CBC', 'isActive': False, 'createdAt': '2025-09-21T08:03:50.536Z', 'updatedAt': '2025-09-21T08:03:50.662Z'}
# [GET LABTESTS BY DEPARTMENT] Pathology: 200
# [{'id': 1, 'name': 'Blood Glucose Updated', 'description': 'Updated description', 'departmentName': 'Pathology', 'templateName': 'CBC', 'isActive': False, 'createdAt': '2025-09-21T08:03:50.536Z', 'updatedAt': '2025-09-21T08:03:50.662Z'}, {'id': 2, 'name': 'Blood Glucose', 'description': 'Blood glucose measurement', 'departmentName': 'Pathology', 'templateName': 'CBC', 'isActive': True, 'createdAt': '2025-09-21T08:31:59.046Z', 'updatedAt': '2025-09-21T08:31:59.046Z'}]
# [UPDATE LABTEST] ID 1: 200
# {'id': 1, 'name': 'Blood Glucose Updated', 'description': 'Updated description', 'departmentName': 'Pathology', 'templateName': 'CBC', 'isActive': False, 'createdAt': '2025-09-21T08:03:50.536Z', 'updatedAt': '2025-09-21T08:31:59.278Z'}
# [DEACTIVATE LABTEST] ID 1: 200
# {'id': 1, 'name': 'Blood Glucose Updated', 'description': 'Updated description', 'departmentName': 'Pathology', 'templateName': 'CBC', 'isActive': False, 'createdAt': '2025-09-21T08:03:50.536Z', 'updatedAt': '2025-09-21T08:31:59.396Z'}
# [GET ALL TEMPLATES] Status: 200
# [{'id': 1, 'name': 'CBC', 'description': 'Complete Blood Count (updated)', 'version': 'v2', 'formStructure': '{"profiles":[{"name":"Profile 1","sections":[{"name":"Section 1","fields":[{"label":"Field 1","type":"text","unit":"Unit","referenceRange":"Reference"}],"notes":""}]},{"name":"Profile 2","sections":[{"name":"Section 2","fields":[{"label":"Filed 2","type":"text","unit":"dfsd","referenceRange":"dsf"},{"label":"fILED ","type":"text","unit":"LKJL","referenceRange":"KLJ"}],"notes":""}]}]}', 'isActive': True, 'createdAt': '2025-09-21T06:44:33.486Z', 'updatedAt': '2025-09-21T07:39:56.884Z'}, {'id': 6, 'name': 'werty', 'description': 'l', 'version': 'jk', 'formStructure': '{"profiles":[{"name":"jkl","sections":[{"name":"jl","fields":[{"label":"j","type":"text","unit":"l","referenceRange":"jl"}],"notes":"lj"}]}]}', 'isActive': True, 'createdAt': '2025-09-21T07:40:16.823Z', 'updatedAt': '2025-09-21T07:40:37.165Z'}]