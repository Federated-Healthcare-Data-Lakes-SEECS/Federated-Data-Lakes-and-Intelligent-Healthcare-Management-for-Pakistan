"""
Comprehensive API Testing Client for Hospital Backend
Tests all endpoints across all modules
"""

import requests
import json
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import time

BASE_URL = 'http://localhost:3002'


# ============================================================================
# HELPER CLASSES
# ============================================================================

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_section(title: str):
    """Print a section header"""
    print(f"\n{Colors.HEADER}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{title.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{'=' * 80}{Colors.ENDC}\n")


def print_test(name: str, status: int, success_codes=[200, 201]):
    """Print test result"""
    is_success = status in success_codes
    color = Colors.OKGREEN if is_success else Colors.FAIL
    symbol = "✓" if is_success else "✗"
    print(f"{color}{symbol} {name} - Status: {status}{Colors.ENDC}")


def print_response(response: requests.Response, show_body: bool = True):
    """Print formatted response"""
    if show_body and response.status_code in [200, 201]:
        try:
            print(json.dumps(response.json(), indent=2, default=str))
        except:
            print(response.text)
    elif response.status_code >= 400:
        print(f"{Colors.WARNING}Error: {response.text}{Colors.ENDC}")


# ============================================================================
# API CLIENT CLASSES
# ============================================================================

class AuthClient:
    """Authentication API client"""
    
    def __init__(self):
        self.token = None
    
    def login(self, email: str, password: str) -> Optional[str]:
        """Login and get access token"""
        payload = {"email": email, "password": password}
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        print_test(f"Login as {email}", response.status_code)
        
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            return self.token
        else:
            print_response(response, show_body=False)
            return None
    
    def register(self, payload: Dict[str, Any]) -> requests.Response:
        """Register a new user"""
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print_test(f"Register {payload.get('email', 'user')}", response.status_code)
        print_response(response)
        return response


class UserClient:
    """User API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def get_profile(self) -> requests.Response:
        """Get current user profile"""
        response = requests.get(f"{BASE_URL}/users/me", headers=self.headers)
        print_test("Get user profile", response.status_code)
        print_response(response)
        return response
    
    def update_patient_profile(self, patient_data: Dict[str, Any]) -> requests.Response:
        """Update patient profile"""
        response = requests.put(
            f"{BASE_URL}/users/me/patient-profile",
            headers=self.headers,
            json=patient_data
        )
        print_test("Update patient profile", response.status_code)
        print_response(response)
        return response


class DepartmentClient:
    """Department API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def register(self, payload: Dict[str, Any]) -> requests.Response:
        """Register a new department"""
        response = requests.post(
            f"{BASE_URL}/departments/register",
            json=payload,
            headers=self.headers
        )
        print_test(f"Register department {payload.get('name', 'N/A')}", response.status_code)
        print_response(response)
        return response
    
    def update(self, dept_id: int, payload: Dict[str, Any]) -> requests.Response:
        """Update a department"""
        response = requests.put(
            f"{BASE_URL}/departments/{dept_id}",
            json=payload,
            headers=self.headers
        )
        print_test(f"Update department {dept_id}", response.status_code)
        print_response(response)
        return response
    
    def get_all(self) -> requests.Response:
        """Get all departments"""
        response = requests.get(f"{BASE_URL}/departments", headers=self.headers)
        print_test("Get all departments", response.status_code)
        print_response(response)
        return response
    
    def get_standard(self) -> requests.Response:
        """Get standard departments"""
        response = requests.get(f"{BASE_URL}/departments/standard", headers=self.headers)
        print_test("Get standard departments", response.status_code)
        print_response(response)
        return response


class DoctorClient:
    """Doctor API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def register(self, payload: Dict[str, Any]) -> requests.Response:
        """Register a new doctor"""
        response = requests.post(
            f"{BASE_URL}/doctors/register",
            json=payload,
            headers=self.headers
        )
        print_test(f"Register doctor {payload.get('email', 'N/A')}", response.status_code)
        print_response(response)
        return response
    
    def update(self, doctor_id: int, payload: Dict[str, Any]) -> requests.Response:
        """Update a doctor"""
        response = requests.patch(
            f"{BASE_URL}/doctors/{doctor_id}",
            json=payload,
            headers=self.headers
        )
        print_test(f"Update doctor {doctor_id}", response.status_code)
        print_response(response)
        return response
    
    def get_all(self) -> requests.Response:
        """Get all doctors"""
        response = requests.get(f"{BASE_URL}/doctors", headers=self.headers)
        print_test("Get all doctors", response.status_code)
        print_response(response)
        return response
    
    def get_by_id(self, doctor_id: int) -> requests.Response:
        """Get doctor by ID"""
        response = requests.get(f"{BASE_URL}/doctors/{doctor_id}", headers=self.headers)
        print_test(f"Get doctor {doctor_id}", response.status_code)
        print_response(response)
        return response
    
    def get_by_department(self, department_name: str) -> requests.Response:
        """Get doctors by department"""
        response = requests.get(
            f"{BASE_URL}/doctors/department/{department_name}",
            headers=self.headers
        )
        print_test(f"Get doctors in {department_name}", response.status_code)
        print_response(response)
        return response
    
    def delete(self, doctor_id: int) -> requests.Response:
        """Delete a doctor"""
        response = requests.delete(f"{BASE_URL}/doctors/{doctor_id}", headers=self.headers)
        print_test(f"Delete doctor {doctor_id}", response.status_code)
        print_response(response)
        return response
    
    # Doctor-specific endpoints (require DOCTOR role)
    def get_profile(self) -> requests.Response:
        """Get doctor profile"""
        response = requests.get(f"{BASE_URL}/doctors/profile", headers=self.headers)
        print_test("Get doctor profile", response.status_code)
        print_response(response)
        return response
    
    def get_dashboard_stats(self) -> requests.Response:
        """Get dashboard statistics"""
        response = requests.get(f"{BASE_URL}/doctors/dashboard/stats", headers=self.headers)
        print_test("Get dashboard stats", response.status_code)
        print_response(response)
        return response
    
    def get_upcoming_appointments(self, limit: int = 5) -> requests.Response:
        """Get upcoming appointments"""
        response = requests.get(
            f"{BASE_URL}/doctors/dashboard/upcoming-appointments?limit={limit}",
            headers=self.headers
        )
        print_test("Get upcoming appointments", response.status_code)
        print_response(response)
        return response
    
    def get_recent_checkups(self, limit: int = 5) -> requests.Response:
        """Get recent checkups"""
        response = requests.get(
            f"{BASE_URL}/doctors/dashboard/recent-checkups?limit={limit}",
            headers=self.headers
        )
        print_test("Get recent checkups", response.status_code)
        print_response(response)
        return response
    
    def get_booked_appointments(self) -> requests.Response:
        """Get booked appointments"""
        response = requests.get(f"{BASE_URL}/doctors/appointments/booked", headers=self.headers)
        print_test("Get booked appointments", response.status_code)
        print_response(response)
        return response


class ReceptionistClient:
    """Receptionist API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def register(self, payload: Dict[str, Any]) -> requests.Response:
        """Register a new receptionist"""
        response = requests.post(
            f"{BASE_URL}/receptionists/register",
            json=payload,
            headers=self.headers
        )
        print_test(f"Register receptionist {payload.get('email', 'N/A')}", response.status_code)
        print_response(response)
        return response
    
    def update(self, receptionist_id: int, payload: Dict[str, Any]) -> requests.Response:
        """Update a receptionist"""
        response = requests.patch(
            f"{BASE_URL}/receptionists/{receptionist_id}",
            json=payload,
            headers=self.headers
        )
        print_test(f"Update receptionist {receptionist_id}", response.status_code)
        print_response(response)
        return response
    
    def get_all(self) -> requests.Response:
        """Get all receptionists"""
        response = requests.get(f"{BASE_URL}/receptionists", headers=self.headers)
        print_test("Get all receptionists", response.status_code)
        print_response(response)
        return response
    
    def get_by_id(self, receptionist_id: int) -> requests.Response:
        """Get receptionist by ID"""
        response = requests.get(f"{BASE_URL}/receptionists/{receptionist_id}", headers=self.headers)
        print_test(f"Get receptionist {receptionist_id}", response.status_code)
        print_response(response)
        return response
    
    def delete(self, receptionist_id: int) -> requests.Response:
        """Delete a receptionist"""
        response = requests.delete(f"{BASE_URL}/receptionists/{receptionist_id}", headers=self.headers)
        print_test(f"Delete receptionist {receptionist_id}", response.status_code)
        print_response(response)
        return response


class PatientClient:
    """Patient API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def register(self, payload: Dict[str, Any]) -> requests.Response:
        """Register a new patient"""
        response = requests.post(
            f"{BASE_URL}/patients/register",
            json=payload,
            headers=self.headers
        )
        print_test(f"Register patient {payload.get('email', 'N/A')}", response.status_code)
        print_response(response)
        return response
    
    def get_all(self) -> requests.Response:
        """Get all patients"""
        response = requests.get(f"{BASE_URL}/patients", headers=self.headers)
        print_test("Get all patients", response.status_code)
        print_response(response)
        return response


class ScheduleClient:
    """Doctor Schedule API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def create(self, payload: Dict[str, Any]) -> requests.Response:
        """Create a new doctor schedule"""
        response = requests.post(
            f"{BASE_URL}/doctorschedules",
            json=payload,
            headers=self.headers
        )
        print_test("Create doctor schedule", response.status_code)
        print_response(response)
        return response
    
    def get_all(self) -> requests.Response:
        """Get all schedules for the current doctor"""
        response = requests.get(f"{BASE_URL}/doctorschedules", headers=self.headers)
        print_test("Get all doctor schedules", response.status_code)
        print_response(response)
        return response
    
    def get_by_id(self, schedule_id: int) -> requests.Response:
        """Get a specific schedule by ID"""
        response = requests.get(f"{BASE_URL}/doctorschedules/{schedule_id}", headers=self.headers)
        print_test(f"Get schedule {schedule_id}", response.status_code)
        print_response(response)
        return response
    
    def delete(self, schedule_id: int) -> requests.Response:
        """Delete a schedule by ID"""
        response = requests.delete(f"{BASE_URL}/doctorschedules/{schedule_id}", headers=self.headers)
        print_test(f"Delete schedule {schedule_id}", response.status_code)
        print_response(response)
        return response


class DrugClient:
    """Drug API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def register(self, payload: Dict[str, Any]) -> requests.Response:
        """Register a new drug"""
        response = requests.post(
            f"{BASE_URL}/drugs/register",
            json=payload,
            headers=self.headers
        )
        print_test(f"Register drug {payload.get('name', 'N/A')}", response.status_code)
        print_response(response)
        return response
    
    def update(self, drug_id: int, payload: Dict[str, Any]) -> requests.Response:
        """Update a drug"""
        response = requests.patch(
            f"{BASE_URL}/drugs/{drug_id}",
            json=payload,
            headers=self.headers
        )
        print_test(f"Update drug {drug_id}", response.status_code)
        print_response(response)
        return response
    
    def get_all(self) -> requests.Response:
        """Get all drugs"""
        response = requests.get(f"{BASE_URL}/drugs", headers=self.headers)
        print_test("Get all drugs", response.status_code)
        print_response(response)
        return response
    
    def deactivate(self, drug_id: int) -> requests.Response:
        """Deactivate a drug"""
        response = requests.patch(f"{BASE_URL}/drugs/{drug_id}/deactivate", headers=self.headers)
        print_test(f"Deactivate drug {drug_id}", response.status_code)
        print_response(response)
        return response


class LabTestTemplateClient:
    """Lab Test Template API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def register(self, payload: Dict[str, Any]) -> requests.Response:
        """Register a new lab test template"""
        response = requests.post(
            f"{BASE_URL}/labtesttemplate",
            json=payload,
            headers=self.headers
        )
        print_test(f"Register lab test template {payload.get('name', 'N/A')}", response.status_code)
        print_response(response)
        return response
    
    def update(self, template_id: int, payload: Dict[str, Any]) -> requests.Response:
        """Update a lab test template"""
        response = requests.put(
            f"{BASE_URL}/labtesttemplate/{template_id}",
            json=payload,
            headers=self.headers
        )
        print_test(f"Update lab test template {template_id}", response.status_code)
        print_response(response)
        return response
    
    def get_all(self) -> requests.Response:
        """Get all lab test templates"""
        response = requests.get(f"{BASE_URL}/labtesttemplate", headers=self.headers)
        print_test("Get all lab test templates", response.status_code)
        print_response(response)
        return response
    
    def get_by_id(self, template_id: int) -> requests.Response:
        """Get lab test template by ID"""
        response = requests.get(f"{BASE_URL}/labtesttemplate/{template_id}", headers=self.headers)
        print_test(f"Get lab test template {template_id}", response.status_code)
        print_response(response)
        return response
    
    def toggle(self, template_id: int) -> requests.Response:
        """Toggle lab test template active status"""
        response = requests.patch(f"{BASE_URL}/labtesttemplate/{template_id}/toggle", headers=self.headers)
        print_test(f"Toggle lab test template {template_id}", response.status_code)
        print_response(response)
        return response


class LabTestClient:
    """Lab Test API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def register(self, payload: Dict[str, Any]) -> requests.Response:
        """Register a new lab test"""
        response = requests.post(
            f"{BASE_URL}/lab-tests/register",
            json=payload,
            headers=self.headers
        )
        print_test(f"Register lab test {payload.get('name', 'N/A')}", response.status_code)
        print_response(response)
        return response
    
    def update(self, test_id: int, payload: Dict[str, Any]) -> requests.Response:
        """Update a lab test"""
        response = requests.patch(
            f"{BASE_URL}/lab-tests/{test_id}",
            json=payload,
            headers=self.headers
        )
        print_test(f"Update lab test {test_id}", response.status_code)
        print_response(response)
        return response
    
    def get_all(self) -> requests.Response:
        """Get all lab tests"""
        response = requests.get(f"{BASE_URL}/lab-tests", headers=self.headers)
        print_test("Get all lab tests", response.status_code)
        print_response(response)
        return response
    
    def get_by_id(self, test_id: int) -> requests.Response:
        """Get lab test by ID"""
        response = requests.get(f"{BASE_URL}/lab-tests/{test_id}", headers=self.headers)
        print_test(f"Get lab test {test_id}", response.status_code)
        print_response(response)
        return response
    
    def get_by_department(self, department_name: str) -> requests.Response:
        """Get lab tests by department"""
        response = requests.get(
            f"{BASE_URL}/lab-tests/department/{department_name}",
            headers=self.headers
        )
        print_test(f"Get lab tests in {department_name}", response.status_code)
        print_response(response)
        return response
    
    def toggle(self, test_id: int) -> requests.Response:
        """Toggle lab test active status"""
        response = requests.patch(f"{BASE_URL}/lab-tests/{test_id}/toggle", headers=self.headers)
        print_test(f"Toggle lab test {test_id}", response.status_code)
        print_response(response)
        return response


class CheckupClient:
    """Checkup API client"""
    
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def create(self, payload: Dict[str, Any]) -> requests.Response:
        """Create a new checkup"""
        response = requests.post(
            f"{BASE_URL}/checkups",
            json=payload,
            headers=self.headers
        )
        print_test("Create checkup", response.status_code)
        print_response(response)
        return response
    
    def get_history(self) -> requests.Response:
        """Get checkup history"""
        response = requests.get(f"{BASE_URL}/checkups/history", headers=self.headers)
        print_test("Get checkup history", response.status_code)
        print_response(response)
        return response
    
    def get_by_id(self, checkup_id: int) -> requests.Response:
        """Get checkup by ID"""
        response = requests.get(f"{BASE_URL}/checkups/{checkup_id}", headers=self.headers)
        print_test(f"Get checkup {checkup_id}", response.status_code)
        print_response(response)
        return response


# ============================================================================
# TEST SUITES
# ============================================================================

def test_auth_apis():
    """Test authentication APIs"""
    print_section("AUTHENTICATION APIS")
    
    auth = AuthClient()
    
    # Test registration (might fail if user exists)
    print(f"\n{Colors.BOLD}Testing Registration:{Colors.ENDC}")
    user_payload = {
        "firstName": "Test",
        "lastName": "User",
        "email": "test.user@hospital.com",
        "password": "Test@Pass123!",
        "cnic": "12345-1234567-8",
        "gender": "MALE"
    }
    auth.register(user_payload)
    
    # Test login
    print(f"\n{Colors.BOLD}Testing Login:{Colors.ENDC}")
    admin_token = auth.login("admin@hospital.com", "admin123456")
    
    return admin_token


def test_user_apis(user_token: str):
    """Test user APIs"""
    print_section("USER APIS")
    
    user_client = UserClient(user_token)
    
    # Get profile
    print(f"\n{Colors.BOLD}Testing Get Profile:{Colors.ENDC}")
    user_client.get_profile()
    
    # Update patient profile
    print(f"\n{Colors.BOLD}Testing Update Patient Profile:{Colors.ENDC}")
    patient_data = {
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "bloodGroup": "A+",
        "medicalHistory": "No major illnesses",
        "familyHistory": "No hereditary conditions",
        "allergies": "None",
        "address": "123 Main St, City",
        "phoneNumber": "+1234567890",
        "emergencyContact": "+0987654321"
    }
    user_client.update_patient_profile(patient_data)


def test_department_apis(admin_token: str):
    """Test department APIs"""
    print_section("DEPARTMENT APIS")
    
    dept_client = DepartmentClient(admin_token)
    
    # Get all departments
    print(f"\n{Colors.BOLD}Testing Get All Departments:{Colors.ENDC}")
    dept_client.get_all()
    
    # Get standard departments
    print(f"\n{Colors.BOLD}Testing Get Standard Departments:{Colors.ENDC}")
    dept_client.get_standard()
    
    # Register a new department
    print(f"\n{Colors.BOLD}Testing Register Department:{Colors.ENDC}")
    dept_payload = {
        "name": "Test Department",
        "code": "TEST",
        "description": "A test department"
    }
    dept_response = dept_client.register(dept_payload)
    
    dept_id = None
    if dept_response.status_code in [200, 201]:
        dept_id = dept_response.json().get('id')
    
    # Update department
    if dept_id:
        print(f"\n{Colors.BOLD}Testing Update Department:{Colors.ENDC}")
        update_payload = {
            "description": "Updated test department description"
        }
        dept_client.update(dept_id, update_payload)
    
    return dept_id


def test_doctor_apis(admin_token: str):
    """Test doctor APIs (admin role)"""
    print_section("DOCTOR APIS (ADMIN)")
    
    doctor_client = DoctorClient(admin_token)
    
    # Register a new doctor
    print(f"\n{Colors.BOLD}Testing Register Doctor:{Colors.ENDC}")
    doctor_payload = {
        "firstName": "Ahmed",
        "lastName": "Ali",
        "email": "ahmed.ali@hospital.com",
        "gender": "MALE",
        "cnic": "12345-1234567-9",
        "licenseNumber": "DOC12345",
        "specialization": "Cardiology",
        "experience": 5,
        "qualification": "MBBS, MD Cardiology",
        "departmentName": "Cardiology Department"  # Use existing department name
    }
    doctor_response = doctor_client.register(doctor_payload)
    
    doctor_id = None
    if doctor_response.status_code in [200, 201]:
        doctor_id = doctor_response.json().get('id')
    
    # Get all doctors
    print(f"\n{Colors.BOLD}Testing Get All Doctors:{Colors.ENDC}")
    doctor_client.get_all()
    
    # Get doctor by ID
    if doctor_id:
        print(f"\n{Colors.BOLD}Testing Get Doctor By ID:{Colors.ENDC}")
        doctor_client.get_by_id(doctor_id)
    
    # Get doctors by department
    print(f"\n{Colors.BOLD}Testing Get Doctors By Department:{Colors.ENDC}")
    doctor_client.get_by_department("Cardiology Department")
    
    # Update doctor
    if doctor_id:
        print(f"\n{Colors.BOLD}Testing Update Doctor:{Colors.ENDC}")
        update_payload = {
            "experience": 6,
            "qualification": "MBBS, MD Cardiology, Fellowship"
        }
        doctor_client.update(doctor_id, update_payload)
    
    return doctor_id


def test_doctor_dashboard_apis(doctor_token: str):
    """Test doctor dashboard APIs (doctor role)"""
    print_section("DOCTOR DASHBOARD APIS")
    
    doctor_client = DoctorClient(doctor_token)
    
    # Get doctor profile
    print(f"\n{Colors.BOLD}Testing Get Doctor Profile:{Colors.ENDC}")
    doctor_client.get_profile()
    
    # Get dashboard stats
    print(f"\n{Colors.BOLD}Testing Get Dashboard Stats:{Colors.ENDC}")
    doctor_client.get_dashboard_stats()
    
    # Get upcoming appointments
    print(f"\n{Colors.BOLD}Testing Get Upcoming Appointments:{Colors.ENDC}")
    doctor_client.get_upcoming_appointments(limit=5)
    
    # Get recent checkups
    print(f"\n{Colors.BOLD}Testing Get Recent Checkups:{Colors.ENDC}")
    doctor_client.get_recent_checkups(limit=5)
    
    # Get booked appointments
    print(f"\n{Colors.BOLD}Testing Get Booked Appointments:{Colors.ENDC}")
    doctor_client.get_booked_appointments()


def test_receptionist_apis(admin_token: str):
    """Test receptionist APIs"""
    print_section("RECEPTIONIST APIS")
    
    recep_client = ReceptionistClient(admin_token)
    
    # Register a new receptionist
    print(f"\n{Colors.BOLD}Testing Register Receptionist:{Colors.ENDC}")
    recep_payload = {
        "firstName": "Sara",
        "lastName": "Ahmed",
        "email": "sara.ahmed@hospital.com",
        "gender": "FEMALE",
        "cnic": "12345-1234568-1",
        "phoneNumber": "+923001234567",
        "shift": "MORNING"
    }
    recep_response = recep_client.register(recep_payload)
    
    recep_id = None
    if recep_response.status_code in [200, 201]:
        recep_id = recep_response.json().get('id')
    
    # Get all receptionists
    print(f"\n{Colors.BOLD}Testing Get All Receptionists:{Colors.ENDC}")
    recep_client.get_all()
    
    # Get receptionist by ID
    if recep_id:
        print(f"\n{Colors.BOLD}Testing Get Receptionist By ID:{Colors.ENDC}")
        recep_client.get_by_id(recep_id)
    
    # Update receptionist
    if recep_id:
        print(f"\n{Colors.BOLD}Testing Update Receptionist:{Colors.ENDC}")
        update_payload = {
            "shift": "EVENING"
        }
        recep_client.update(recep_id, update_payload)
    
    return recep_id


def test_patient_apis(admin_token: str):
    """Test patient APIs"""
    print_section("PATIENT APIS")
    
    patient_client = PatientClient(admin_token)
    
    # Register a new patient
    print(f"\n{Colors.BOLD}Testing Register Patient:{Colors.ENDC}")
    patient_payload = {
        "firstName": "Fatima",
        "lastName": "Hassan",
        "email": "fatima.hassan@example.com",
        "gender": "FEMALE",
        "cnic": "12345-1234569-2",
        "dateOfBirth": "1995-05-15T00:00:00.000Z",
        "bloodGroup": "B+",
        "phoneNumber": "+923001234568",
        "address": "456 Street, City",
        "emergencyContact": "+923009876543"
    }
    patient_response = patient_client.register(patient_payload)
    
    patient_id = None
    if patient_response.status_code in [200, 201]:
        patient_id = patient_response.json().get('id')
    
    # Get all patients
    print(f"\n{Colors.BOLD}Testing Get All Patients:{Colors.ENDC}")
    patient_client.get_all()
    
    return patient_id


def test_schedule_apis(doctor_token: str):
    """Test doctor schedule APIs"""
    print_section("DOCTOR SCHEDULE APIS")
    
    schedule_client = ScheduleClient(doctor_token)
    
    # Create a new schedule
    print(f"\n{Colors.BOLD}Testing Create Schedule:{Colors.ENDC}")
    now = datetime.now(timezone.utc)
    tomorrow = now + timedelta(days=1)
    schedule_payload = {
        "from": tomorrow.replace(hour=9, minute=0, second=0, microsecond=0).isoformat(),
        "to": tomorrow.replace(hour=17, minute=0, second=0, microsecond=0).isoformat(),
        "noOfSlots": 8
    }
    schedule_response = schedule_client.create(schedule_payload)
    
    schedule_id = None
    if schedule_response.status_code in [200, 201]:
        schedule_id = schedule_response.json().get('id')
    
    # Get all schedules
    print(f"\n{Colors.BOLD}Testing Get All Schedules:{Colors.ENDC}")
    schedule_client.get_all()
    
    # Get schedule by ID
    if schedule_id:
        print(f"\n{Colors.BOLD}Testing Get Schedule By ID:{Colors.ENDC}")
        schedule_client.get_by_id(schedule_id)
    
    # Test overlapping schedule (should fail)
    print(f"\n{Colors.BOLD}Testing Overlapping Schedule (should fail):{Colors.ENDC}")
    overlap_payload = {
        "from": tomorrow.replace(hour=10, minute=0, second=0, microsecond=0).isoformat(),
        "to": tomorrow.replace(hour=12, minute=0, second=0, microsecond=0).isoformat(),
        "noOfSlots": 4
    }
    schedule_client.create(overlap_payload)
    
    return schedule_id


def test_drug_apis(admin_token: str):
    """Test drug APIs"""
    print_section("DRUG APIS")
    
    drug_client = DrugClient(admin_token)
    
    # Register a new drug
    print(f"\n{Colors.BOLD}Testing Register Drug:{Colors.ENDC}")
    drug_payload = {
        "name": "Paracetamol",
        "description": "Pain reliever and fever reducer",
        "formulaName": "Acetaminophen",
        "chemicalFormula": "C8H9NO2",
        "dosageForm": "Tablet",
        "strength": "500mg",
        "supplier": "PharmaCorp",
        "price": 50.0,
        "stock": 1000,
        "isActive": True
    }
    drug_response = drug_client.register(drug_payload)
    
    drug_id = None
    if drug_response.status_code in [200, 201]:
        drug_id = drug_response.json().get('id')
    
    # Get all drugs
    print(f"\n{Colors.BOLD}Testing Get All Drugs:{Colors.ENDC}")
    drug_client.get_all()
    
    # Update drug
    if drug_id:
        print(f"\n{Colors.BOLD}Testing Update Drug:{Colors.ENDC}")
        update_payload = {
            "name": "Paracetamol",
            "description": "Pain reliever and fever reducer - Updated",
            "formulaName": "Acetaminophen",
            "chemicalFormula": "C8H9NO2",
            "dosageForm": "Tablet",
            "strength": "500mg",
            "supplier": "PharmaCorp International",
            "isActive": True
        }
        drug_client.update(drug_id, update_payload)
    
    # Deactivate drug
    if drug_id:
        print(f"\n{Colors.BOLD}Testing Deactivate Drug:{Colors.ENDC}")
        drug_client.deactivate(drug_id)
    
    return drug_id


def test_labtest_template_apis(admin_token: str):
    """Test lab test template APIs"""
    print_section("LAB TEST TEMPLATE APIS")
    
    template_client = LabTestTemplateClient(admin_token)
    
    # Register a new lab test template
    print(f"\n{Colors.BOLD}Testing Register Lab Test Template:{Colors.ENDC}")
    form_structure = {
        "fields": [
            {"name": "hemoglobin", "type": "number", "unit": "g/dL", "normalRange": "12-16"},
            {"name": "wbc", "type": "number", "unit": "cells/mcL", "normalRange": "4000-11000"},
            {"name": "rbc", "type": "number", "unit": "million cells/mcL", "normalRange": "4.5-5.5"},
            {"name": "platelets", "type": "number", "unit": "cells/mcL", "normalRange": "150000-400000"}
        ]
    }
    
    template_payload = {
        "name": "Complete Blood Count Template",
        "description": "Standard CBC test form structure",
        "version": "1.0",
        "formStructure": json.dumps(form_structure),  # Convert to JSON string
        "isActive": True
    }
    template_response = template_client.register(template_payload)
    
    template_id = None
    if template_response.status_code in [200, 201]:
        template_id = template_response.json().get('id')
    
    # Get all lab test templates
    print(f"\n{Colors.BOLD}Testing Get All Lab Test Templates:{Colors.ENDC}")
    template_client.get_all()
    
    # Get lab test template by ID
    if template_id:
        print(f"\n{Colors.BOLD}Testing Get Lab Test Template By ID:{Colors.ENDC}")
        template_client.get_by_id(template_id)
    
    # Update lab test template
    if template_id:
        print(f"\n{Colors.BOLD}Testing Update Lab Test Template:{Colors.ENDC}")
        update_payload = {
            "description": "Updated CBC test form structure with additional fields",
            "version": "1.1"
        }
        template_client.update(template_id, update_payload)
    
    # Toggle lab test template
    if template_id:
        print(f"\n{Colors.BOLD}Testing Toggle Lab Test Template:{Colors.ENDC}")
        template_client.toggle(template_id)
        # Toggle back to active
        template_client.toggle(template_id)
    
    return template_id


def test_labtest_apis(admin_token: str, template_id: Optional[int]):
    """Test lab test APIs"""
    print_section("LAB TEST APIS")
    
    labtest_client = LabTestClient(admin_token)
    
    # Register a new lab test
    print(f"\n{Colors.BOLD}Testing Register Lab Test:{Colors.ENDC}")
    if not template_id:
        print(f"{Colors.WARNING}No template ID available - skipping lab test creation{Colors.ENDC}")
        return None
    
    labtest_payload = {
        "name": "Complete Blood Count",
        "description": "CBC test measures different components of blood",
        "price": 500.0,
        "templateId": template_id,
        "departmentName": "Cardiology Department"
    }
    labtest_response = labtest_client.register(labtest_payload)
    
    labtest_id = None
    if labtest_response.status_code in [200, 201]:
        labtest_id = labtest_response.json().get('id')
    
    # Get all lab tests
    print(f"\n{Colors.BOLD}Testing Get All Lab Tests:{Colors.ENDC}")
    labtest_client.get_all()
    
    # Get lab test by ID
    if labtest_id:
        print(f"\n{Colors.BOLD}Testing Get Lab Test By ID:{Colors.ENDC}")
        labtest_client.get_by_id(labtest_id)
    
    # Get lab tests by department
    print(f"\n{Colors.BOLD}Testing Get Lab Tests By Department:{Colors.ENDC}")
    labtest_client.get_by_department("Cardiology Department")
    
    # Update lab test
    if labtest_id:
        print(f"\n{Colors.BOLD}Testing Update Lab Test:{Colors.ENDC}")
        update_payload = {
            "price": 550.0,
            "description": "CBC test measures different components of blood - Updated"
        }
        labtest_client.update(labtest_id, update_payload)
    
    # Toggle lab test (deactivate then reactivate)
    if labtest_id:
        print(f"\n{Colors.BOLD}Testing Toggle Lab Test (Deactivate):{Colors.ENDC}")
        labtest_client.toggle(labtest_id)
        
        print(f"\n{Colors.BOLD}Testing Toggle Lab Test (Reactivate):{Colors.ENDC}")
        labtest_client.toggle(labtest_id)
    
    return labtest_id


def test_checkup_apis(doctor_token: str, patient_id: Optional[int], schedule_id: Optional[int]):
    """Test checkup APIs"""
    print_section("CHECKUP APIS")
    
    checkup_client = CheckupClient(doctor_token)
    
    # Create a new checkup (need valid appointmentId)
    print(f"\n{Colors.BOLD}Testing Create Checkup:{Colors.ENDC}")
    print(f"{Colors.WARNING}Note: This may fail if no valid appointment exists{Colors.ENDC}")
    checkup_payload = {
        "appointmentId": 1,  # This should be a valid appointment ID
        "diagnosis": "Patient is healthy with minor cold",
        "symptoms": "Mild fever, runny nose",
        "bloodPressure": "120/80",
        "temperature": "99.2",
        "heartRate": "75",
        "bloodSugar": "95",
        "notes": "Advised rest and plenty of fluids",
        "medications": [
            {
                "drugId": 1,
                "dosePerIntake": "500mg",
                "timesPerDay": 2,
                "totalDays": 5,
                "instructions": "Take after meals"
            }
        ],
        "additionalMedications": "Vitamin C supplements",
        "recommendedLabTestIds": [1] if patient_id else [],
        "additionalTests": "Complete Blood Count if symptoms persist"
    }
    checkup_response = checkup_client.create(checkup_payload)
    
    checkup_id = None
    if checkup_response.status_code in [200, 201]:
        checkup_id = checkup_response.json().get('id')
    
    # Get checkup history
    print(f"\n{Colors.BOLD}Testing Get Checkup History:{Colors.ENDC}")
    checkup_client.get_history()
    
    # Get checkup by ID
    if checkup_id:
        print(f"\n{Colors.BOLD}Testing Get Checkup By ID:{Colors.ENDC}")
        checkup_client.get_by_id(checkup_id)
    
    return checkup_id


def cleanup_test_data(admin_token: str, doctor_token: str, ids: Dict[str, Any]):
    """Clean up test data"""
    print_section("CLEANUP TEST DATA")
    
    # Delete schedule
    if ids.get('schedule_id'):
        print(f"\n{Colors.BOLD}Deleting Schedule:{Colors.ENDC}")
        schedule_client = ScheduleClient(doctor_token)
        schedule_client.delete(ids['schedule_id'])
    
    # Delete doctor (cascades to schedules)
    if ids.get('doctor_id'):
        print(f"\n{Colors.BOLD}Deleting Doctor:{Colors.ENDC}")
        doctor_client = DoctorClient(admin_token)
        doctor_client.delete(ids['doctor_id'])
    
    # Delete receptionist
    if ids.get('receptionist_id'):
        print(f"\n{Colors.BOLD}Deleting Receptionist:{Colors.ENDC}")
        recep_client = ReceptionistClient(admin_token)
        recep_client.delete(ids['receptionist_id'])
    
    print(f"\n{Colors.OKGREEN}Cleanup completed!{Colors.ENDC}")


# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def main():
    """Run all tests"""
    print(f"{Colors.HEADER}")
    print("=" * 80)
    print("COMPREHENSIVE HOSPITAL BACKEND API TESTING")
    print("=" * 80)
    print(f"{Colors.ENDC}\n")
    
    print(f"{Colors.OKBLUE}Starting comprehensive API tests...{Colors.ENDC}\n")
    print(f"{Colors.WARNING}Note: Some tests may fail if data doesn't exist or permissions are wrong{Colors.ENDC}\n")
    
    # Store IDs for cleanup
    ids = {}
    
    try:
        # Test Auth APIs
        admin_token = test_auth_apis()
        if not admin_token:
            print(f"\n{Colors.FAIL}Failed to get admin token. Aborting tests.{Colors.ENDC}")
            return
        
        # Test User APIs
        test_user_apis(admin_token)
        
        # Test Department APIs
        dept_id = test_department_apis(admin_token)
        ids['department_id'] = dept_id
        
        # Test Doctor APIs (Admin)
        doctor_id = test_doctor_apis(admin_token)
        ids['doctor_id'] = doctor_id
        
        # Login as existing doctor for doctor-specific tests  
        # Use existing doctor even if registration failed
        print(f"\n{Colors.OKBLUE}Logging in as existing doctor for dashboard tests...{Colors.ENDC}")
        auth = AuthClient()
        # Try newly created doctor first, fallback to existing doctor
        doctor_token = auth.login("ahmed.ali@hospital.com", "password123")
        if not doctor_token:
            # Try existing doctor
            doctor_token = auth.login("zohaibmian119@gmail.com", "password123")
            
        if doctor_token:
            # Test Doctor Dashboard APIs
            test_doctor_dashboard_apis(doctor_token)
            
            # Test Schedule APIs
            schedule_id = test_schedule_apis(doctor_token)
            ids['schedule_id'] = schedule_id
            
            # Get patient_id for checkup test
            patient_id = ids.get('patient_id')
            schedule_id = ids.get('schedule_id')
            
            # Test Checkup APIs
            checkup_id = test_checkup_apis(doctor_token, patient_id, schedule_id)
            ids['checkup_id'] = checkup_id
        else:
            print(f"{Colors.FAIL}Could not login as doctor - skipping doctor-specific tests{Colors.ENDC}")
        
        # Test Receptionist APIs
        receptionist_id = test_receptionist_apis(admin_token)
        ids['receptionist_id'] = receptionist_id
        
        # Test Patient APIs
        patient_id = test_patient_apis(admin_token)
        ids['patient_id'] = patient_id
        
        # Test Drug APIs
        drug_id = test_drug_apis(admin_token)
        ids['drug_id'] = drug_id
        
        # Test Lab Test Template APIs
        template_id = test_labtest_template_apis(admin_token)
        ids['template_id'] = template_id
        
        # Test Lab Test APIs
        labtest_id = test_labtest_apis(admin_token, template_id)
        ids['labtest_id'] = labtest_id
        
        # Cleanup (optional - comment out if you want to keep test data)
        print(f"\n{Colors.WARNING}Cleanup is disabled by default. Uncomment to enable.{Colors.ENDC}")
        # cleanup_test_data(admin_token, doctor_token, ids)
        
    except Exception as e:
        print(f"\n{Colors.FAIL}Error during tests: {str(e)}{Colors.ENDC}")
        import traceback
        traceback.print_exc()
    
    # Final summary
    print_section("TEST SUMMARY")
    print(f"{Colors.OKGREEN}All tests completed!{Colors.ENDC}")
    print(f"\nCreated IDs for reference:")
    for key, value in ids.items():
        if value:
            print(f"  - {key}: {value}")


if __name__ == "__main__":
    main()
