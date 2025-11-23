# Receptionist Portal APIs Documentation

## Overview
Complete API documentation for receptionist-specific functionality including patient registration, walk-in appointment booking, and appointment management.

**Base URL**: `http://localhost:3002`

**Authentication**: All endpoints require JWT Bearer token with RECEPTIONIST role

---

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "receptionist@hospital.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": 3,
    "email": "receptionist@hospital.com",
    "firstName": "Sarah",
    "lastName": "Khan",
    "roles": ["RECEPTIONIST"]
  }
}
```

---

## 1. Profile & Dashboard APIs

### 1.1 Get Receptionist Profile
```http
GET /receptionists/profile/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "userId": 3,
  "firstName": "Sarah",
  "lastName": "Khan",
  "email": "receptionist@hospital.com",
  "gender": "FEMALE",
  "cnic": "42201-9876543-2",
  "phoneNumber": "+92-321-9876543",
  "experience": 5,
  "qualification": "Diploma in Healthcare Administration"
}
```

### 1.2 Get Dashboard Statistics
```http
GET /receptionists/dashboard/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "todayAppointments": 5,
  "totalAppointments": 127,
  "upcomingAppointments": 8,
  "patientsRegisteredToday": 2
}
```

---

## 2. Patient Management APIs

### 2.1 Register New Patient
Register a walk-in patient who doesn't have an account yet.

```http
POST /receptionists/patients/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Fatima",
  "lastName": "Malik",
  "email": "fatima.malik@email.com",
  "password": "patient123",
  "gender": "FEMALE",
  "cnic": "42301-1234567-3",
  "dateOfBirth": "1995-08-20",
  "bloodGroup": "A+",
  "phoneNumber": "+92-333-1234567",
  "address": "456 Garden Road, Lahore, Pakistan",
  "emergencyContact": "+92-333-7654321",
  "allergies": "Penicillin",
  "medicalHistory": "Previous surgery in 2020",
  "familyHistory": "Father has diabetes"
}
```

**Required Fields:**
- `firstName` - Patient's first name
- `email` - Unique email address
- `password` - Account password (min 6 characters)
- `gender` - MALE, FEMALE, or OTHER

**Optional Fields:**
- `lastName` - Last name
- `cnic` - National ID card number
- `dateOfBirth` - Format: YYYY-MM-DD
- `bloodGroup` - Blood type (e.g., A+, O-, AB+)
- `phoneNumber` - Contact number
- `address` - Residential address
- `emergencyContact` - Emergency contact number
- `allergies` - Known allergies
- `medicalHistory` - Past medical conditions
- `familyHistory` - Family medical history

**Response:**
```json
{
  "message": "Patient registered successfully",
  "patient": {
    "id": 5,
    "userId": 12,
    "firstName": "Fatima",
    "lastName": "Malik",
    "email": "fatima.malik@email.com",
    "gender": "FEMALE",
    "cnic": "42301-1234567-3",
    "dateOfBirth": "1995-08-20T00:00:00.000Z",
    "bloodGroup": "A+",
    "phoneNumber": "+92-333-1234567",
    "address": "456 Garden Road, Lahore, Pakistan",
    "emergencyContact": "+92-333-7654321",
    "onboardingDone": true
  }
}
```

**Error Responses:**
- `409 Conflict` - Email already exists
- `404 Not Found` - Patient role not found in system
- `400 Bad Request` - Validation error

### 2.2 Search Patients
Search for existing patients by name, email, or CNIC.

```http
GET /receptionists/patients/search?q={searchTerm}
Authorization: Bearer {token}
```

**Query Parameters:**
- `q` - Search term (name, email, or CNIC)

**Example:**
```http
GET /receptionists/patients/search?q=Ahmed
```

**Response:**
```json
[
  {
    "id": 1,
    "userId": 4,
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "patient@hospital.com",
    "gender": "MALE",
    "cnic": "42101-1234567-8",
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "bloodGroup": "O+",
    "phoneNumber": "+92-300-1234567",
    "address": "123 Main Street, Karachi, Pakistan"
  },
  {
    "id": 3,
    "userId": 9,
    "firstName": "Ahmed",
    "lastName": "Khan",
    "email": "ahmed.khan@email.com",
    "gender": "MALE",
    "cnic": "42101-9876543-1",
    "dateOfBirth": "1988-12-10T00:00:00.000Z",
    "bloodGroup": "B+",
    "phoneNumber": "+92-300-9876543",
    "address": "789 Park Avenue, Karachi, Pakistan"
  }
]
```

**Features:**
- Case-insensitive search
- Searches in: firstName, lastName, email, cnic
- Returns up to 20 results
- Results sorted by first name

### 2.3 Get Patient Details by ID
Get complete patient information including medical history.

```http
GET /receptionists/patients/{patientId}
Authorization: Bearer {token}
```

**Example:**
```http
GET /receptionists/patients/1
```

**Response:**
```json
{
  "id": 1,
  "userId": 4,
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "patient@hospital.com",
  "gender": "MALE",
  "cnic": "42101-1234567-8",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "bloodGroup": "O+",
  "phoneNumber": "+92-300-1234567",
  "address": "123 Main Street, Karachi, Pakistan",
  "emergencyContact": "+92-300-7654321",
  "allergies": "None",
  "medicalHistory": "No significant medical history",
  "familyHistory": "No significant family history",
  "onboardingDone": true
}
```

**Error Responses:**
- `404 Not Found` - Patient not found

---

## 3. Appointment Management APIs

### 3.1 Get Doctors with Available Slots
Get list of all doctors with their available appointment slots.

```http
GET /appointment-slots/doctors-with-slots
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "doctor@hospital.com",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD Cardiology",
    "experience": 10,
    "departmentName": "Cardiology Department",
    "userId": 2,
    "gender": "MALE",
    "departmentId": 1,
    "licenseNumber": "DOC-2024-001",
    "availableSlotsCount": 5,
    "upcomingSlots": [
      {
        "id": 1,
        "scheduleId": 1,
        "startTime": "2025-11-24T09:00:00.000Z",
        "endTime": "2025-11-24T09:30:00.000Z",
        "isBookable": true,
        "isBooked": false
      },
      {
        "id": 2,
        "scheduleId": 1,
        "startTime": "2025-11-24T09:30:00.000Z",
        "endTime": "2025-11-24T10:00:00.000Z",
        "isBookable": true,
        "isBooked": false
      }
    ]
  }
]
```

### 3.2 Book Walk-in Appointment
Book a walk-in appointment for a patient (new or existing).

```http
POST /receptionists/appointments/book-walkin
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": 1,
  "slotId": 5,
  "reason": "Walk-in checkup - Chest pain"
}
```

**Required Fields:**
- `patientId` - Patient's ID (from patient search or registration)
- `slotId` - Available appointment slot ID

**Optional Fields:**
- `reason` - Reason for visit

**Response:**
```json
{
  "id": 10,
  "reason": "Walk-in checkup - Chest pain",
  "status": "BOOKED",
  "appointmentType": "walkin",
  "startTime": "2025-11-24T09:30:00.000Z",
  "endTime": "2025-11-24T10:00:00.000Z",
  "createdAt": "2025-11-23T15:30:00.000Z",
  "patient": {
    "id": 1,
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "patient@hospital.com",
    "phoneNumber": "+92-300-1234567",
    "cnic": "42101-1234567-8"
  },
  "doctor": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "doctor@hospital.com",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD Cardiology",
    "experience": 10,
    "departmentName": "Cardiology Department"
  }
}
```

**Error Responses:**
- `404 Not Found` - Patient or slot not found
- `404 Not Found` - Receptionist profile not found
- `400 Bad Request` - Slot is not bookable
- `400 Bad Request` - Slot is already booked
- `400 Bad Request` - Cannot book past slots

**Business Rules:**
- Slot must be bookable (`isBookable: true`)
- Slot must not be already booked (`isBooked: false`)
- Slot must be in the future or today
- Once booked, slot is marked as `isBooked: true`
- Walk-in appointment status starts as "BOOKED"

### 3.3 Get My Appointments
Get all appointments booked by this receptionist with filtering options.

```http
GET /receptionists/appointments/my-appointments
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional) - Filter by status: BOOKED, COMPLETED, NOT_ATTENDED, all
- `timeFilter` (optional) - Filter by time: upcoming, past, all
- `patientSearch` (optional) - Search by patient name or email

**Examples:**

**Get all appointments:**
```http
GET /receptionists/appointments/my-appointments?status=all&timeFilter=all
```

**Get upcoming appointments:**
```http
GET /receptionists/appointments/my-appointments?status=BOOKED&timeFilter=upcoming
```

**Get past appointments:**
```http
GET /receptionists/appointments/my-appointments?timeFilter=past
```

**Search appointments for specific patient:**
```http
GET /receptionists/appointments/my-appointments?patientSearch=Ahmed
```

**Response:**
```json
[
  {
    "id": 10,
    "reason": "Walk-in checkup - Chest pain",
    "status": "BOOKED",
    "appointmentType": "walkin",
    "startTime": "2025-11-24T09:30:00.000Z",
    "endTime": "2025-11-24T10:00:00.000Z",
    "createdAt": "2025-11-23T15:30:00.000Z",
    "patient": {
      "id": 1,
      "firstName": "Ahmed",
      "lastName": "Ali",
      "email": "patient@hospital.com",
      "phoneNumber": "+92-300-1234567",
      "cnic": "42101-1234567-8"
    },
    "doctor": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "doctor@hospital.com",
      "specialization": "Cardiology",
      "qualification": "MBBS, MD Cardiology",
      "experience": 10,
      "departmentName": "Cardiology Department"
    }
  },
  {
    "id": 11,
    "reason": "Walk-in follow-up",
    "status": "COMPLETED",
    "appointmentType": "walkin",
    "startTime": "2025-11-22T14:00:00.000Z",
    "endTime": "2025-11-22T14:30:00.000Z",
    "createdAt": "2025-11-22T10:00:00.000Z",
    "patient": {
      "id": 5,
      "firstName": "Fatima",
      "lastName": "Malik",
      "email": "fatima.malik@email.com",
      "phoneNumber": "+92-333-1234567",
      "cnic": "42301-1234567-3"
    },
    "doctor": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "doctor@hospital.com",
      "specialization": "Cardiology",
      "qualification": "MBBS, MD Cardiology",
      "experience": 10,
      "departmentName": "Cardiology Department"
    }
  }
]
```

**Features:**
- Returns only appointments booked by the logged-in receptionist
- Sorted by start time (most recent first)
- Supports multiple filter combinations
- Patient search is case-insensitive

---

## Status Values

### Walk-in Appointment Status
- `BOOKED` - Appointment confirmed, patient yet to arrive
- `COMPLETED` - Checkup completed by doctor
- `NOT_ATTENDED` - Patient didn't show up

**Note:** Walk-in appointments cannot be cancelled (no CANCELLED status)

---

## Workflow Examples

### Scenario 1: Walk-in Patient (New)

1. **Patient arrives at reception**
   - Patient has no existing account

2. **Register Patient**
   ```http
   POST /receptionists/patients/register
   ```
   - Get patient details
   - Create account with basic info
   - Save `patientId` from response

3. **Find Available Doctor**
   ```http
   GET /appointment-slots/doctors-with-slots
   ```
   - Show available doctors and slots
   - Patient selects doctor and time

4. **Book Walk-in Appointment**
   ```http
   POST /receptionists/appointments/book-walkin
   ```
   - Use `patientId` from step 2
   - Use `slotId` from selected slot
   - Appointment confirmed

5. **Patient sees doctor**
   - Doctor updates status to COMPLETED after checkup

### Scenario 2: Walk-in Patient (Existing)

1. **Patient arrives at reception**
   - Patient has existing account

2. **Search for Patient**
   ```http
   GET /receptionists/patients/search?q=patient-name
   ```
   - Search by name, email, or CNIC
   - Get `patientId` from results

3. **Find Available Doctor**
   ```http
   GET /appointment-slots/doctors-with-slots
   ```

4. **Book Walk-in Appointment**
   ```http
   POST /receptionists/appointments/book-walkin
   ```
   - Use `patientId` from search
   - Use selected `slotId`

### Scenario 3: View Today's Appointments

```http
GET /receptionists/dashboard/stats
```
- View today's statistics

```http
GET /receptionists/appointments/my-appointments?timeFilter=upcoming&status=BOOKED
```
- View all upcoming appointments booked by you

---

## Error Handling

### Common Error Codes

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "This slot is already booked",
  "error": "Bad Request"
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Patient not found",
  "error": "Not Found"
}
```

**409 Conflict**
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## Testing with Python Client

A comprehensive Python test client is provided at:
```
hospital-backend-client/receptionist_portal_test.py
```

### Run Tests:
```bash
cd hospital-backend-client
python receptionist_portal_test.py
```

### Tests Included:
1. ✓ Receptionist Login
2. ✓ Get Profile
3. ✓ Get Dashboard Stats
4. ✓ Register New Patient
5. ✓ Search Patients
6. ✓ Get Patient Details
7. ✓ Search Existing Patient
8. ✓ Get Doctors with Slots
9. ✓ Book Walk-in Appointment (New Patient)
10. ✓ Book Walk-in Appointment (Existing Patient)
11. ✓ Get All My Appointments
12. ✓ Get Upcoming Appointments
13. ✓ Get Past Appointments
14. ✓ Search Appointments by Patient

---

## Test Credentials

**Receptionist:**
- Email: `receptionist@hospital.com`
- Password: `password123`

**Existing Test Patient:**
- Email: `patient@hospital.com`
- Password: `password123`

**Doctor (for reference):**
- Email: `doctor@hospital.com`
- Password: `password123`

---

## Summary

### Total Endpoints: 8

**Profile & Dashboard:** 2 endpoints
- Get Profile
- Get Dashboard Stats

**Patient Management:** 3 endpoints
- Register Patient
- Search Patients
- Get Patient Details

**Appointment Management:** 3 endpoints
- Get Doctors with Slots
- Book Walk-in Appointment
- Get My Appointments

---

## Status: ✅ COMPLETE

All receptionist portal APIs are fully implemented and tested.
