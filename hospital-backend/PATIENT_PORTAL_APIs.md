# Patient Portal Backend APIs

## Overview
Complete REST API implementation for the patient portal with authentication, appointment booking, profile management, and dashboard endpoints.

## Base URL
```
http://localhost:3002
```

## Authentication
All patient endpoints require JWT authentication with PATIENT role.

**Login:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Headers for authenticated requests:**
```
Authorization: Bearer {accessToken}
```

---

## API Endpoints

### 1. Patient Profile

#### Get Profile
```http
GET /patients/profile
Authorization: Bearer {token}
Role: PATIENT

Response 200:
{
  "id": 1,
  "userId": 101,
  "firstName": "Ahmed",
  "lastName": "Khan",
  "email": "patient@example.com",
  "gender": "MALE",
  "cnic": "42101-1234567-1",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "bloodGroup": "B+",
  "phoneNumber": "+92-300-1234567",
  "emergencyContact": "+92-301-7654321",
  "address": "House 123, Street 5, F-7, Islamabad",
  "medicalHistory": "No significant history",
  "familyHistory": "Father has diabetes",
  "allergies": "Penicillin",
  "onboardingDone": true,
  "onboardedAt": "2025-01-15T10:30:00.000Z",
  "createdAt": "2025-01-01T08:00:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

#### Update Profile / Complete Onboarding
```http
PATCH /patients/profile
Authorization: Bearer {token}
Role: PATIENT
Content-Type: application/json

{
  "dateOfBirth": "1990-05-15",
  "bloodGroup": "B+",
  "phoneNumber": "+92-300-1234567",
  "emergencyContact": "+92-301-7654321",
  "address": "House 123, Street 5, F-7, Islamabad",
  "allergies": "Penicillin",
  "medicalHistory": "No significant history",
  "familyHistory": "Father has diabetes",
  "onboardingDone": true
}

Response 200:
{
  "id": 1,
  "userId": 101,
  ...updated fields...
}
```

---

### 2. Dashboard Statistics

#### Get Dashboard Stats
```http
GET /patients/dashboard/stats
Authorization: Bearer {token}
Role: PATIENT

Response 200:
{
  "upcomingAppointments": 3,
  "completedCheckups": 12,
  "pendingLabTests": 2
}
```

#### Get Upcoming Appointments (Dashboard)
```http
GET /patients/dashboard/upcoming-appointments?limit=5
Authorization: Bearer {token}
Role: PATIENT

Response 200:
[
  {
    "id": 45,
    "reason": "Regular checkup",
    "status": "BOOKED",
    "startTime": "2025-11-25T10:00:00.000Z",
    "endTime": "2025-11-25T10:30:00.000Z",
    "doctor": {
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "specialization": "Interventional Cardiology",
      "departmentName": "Cardiology"
    }
  }
]
```

#### Get Recent Checkups (Dashboard)
```http
GET /patients/dashboard/recent-checkups?limit=5
Authorization: Bearer {token}
Role: PATIENT

Response 200:
[
  {
    "id": 12,
    "date": "2025-11-20T14:30:00.000Z",
    "bloodPressure": "120/80",
    "temperature": "98.6",
    "heartRate": "72",
    "bloodSugar": "95",
    "symptoms": "Chest pain, shortness of breath",
    "diagnosis": "Mild angina",
    "notes": "Prescribed medication, follow-up in 2 weeks",
    "doctor": {
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "specialization": "Interventional Cardiology",
      "departmentName": "Cardiology"
    },
    "medications": [
      {
        "drugName": "Aspirin",
        "dosePerIntake": "75mg",
        "timesPerDay": 1,
        "totalDays": 30,
        "instructions": "Take after breakfast"
      }
    ],
    "recommendedLabTests": [
      {
        "id": 5,
        "name": "ECG",
        "description": "Electrocardiogram"
      }
    ]
  }
]
```

---

### 3. Appointment Slots (Browse Doctors & Slots)

#### Get All Doctors with Available Slots
```http
GET /appointment-slots/doctors-with-slots
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 1,
    "userId": 201,
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed.hassan@hospital.com",
    "gender": "MALE",
    "departmentId": 1,
    "departmentName": "Cardiology",
    "licenseNumber": "PMC-12345",
    "specialization": "Interventional Cardiology",
    "qualification": "MBBS, FCPS (Cardiology)",
    "experience": 15,
    "availableSlotsCount": 12,
    "upcomingSlots": [
      {
        "id": 101,
        "scheduleId": 1000,
        "startTime": "2025-11-25T09:00:00.000Z",
        "endTime": "2025-11-25T09:30:00.000Z"
      },
      ...4 more slots
    ]
  },
  ...more doctors
]
```

#### Get Available Slots for Specific Doctor
```http
GET /appointment-slots/doctor/{doctorId}
Authorization: Bearer {token}

Response 200:
{
  "doctor": {
    "id": 1,
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed.hassan@hospital.com",
    "specialization": "Interventional Cardiology",
    "qualification": "MBBS, FCPS (Cardiology)",
    "experience": 15,
    "departmentId": 1,
    "departmentName": "Cardiology",
    "licenseNumber": "PMC-12345"
  },
  "totalAvailableSlots": 12,
  "slots": [
    {
      "id": 101,
      "scheduleId": 1000,
      "startTime": "2025-11-25T09:00:00.000Z",
      "endTime": "2025-11-25T09:30:00.000Z",
      "isBookable": true,
      "isBooked": false
    },
    ...more slots
  ]
}
```

#### Get Available Slots by Department
```http
GET /appointment-slots/available?departmentId=1
Authorization: Bearer {token}

Response 200:
[
  {
    "doctorId": 1,
    "doctorName": "Ahmed Hassan",
    "specialization": "Interventional Cardiology",
    "qualification": "MBBS, FCPS (Cardiology)",
    "experience": 15,
    "departmentId": 1,
    "departmentName": "Cardiology",
    "scheduleId": 1000,
    "scheduleFrom": "2025-11-25T09:00:00.000Z",
    "scheduleTo": "2025-11-25T17:00:00.000Z",
    "slots": [
      {
        "id": 101,
        "startTime": "2025-11-25T09:00:00.000Z",
        "endTime": "2025-11-25T09:30:00.000Z",
        "isBookable": true,
        "isBooked": false
      }
    ]
  }
]
```

#### Get Available Slots by Doctor (Query Param)
```http
GET /appointment-slots/available?doctorId=1
Authorization: Bearer {token}
```

---

### 4. Online Appointments

#### Book Appointment
```http
POST /online-appointments/book
Authorization: Bearer {token}
Role: PATIENT
Content-Type: application/json

{
  "patientId": 1,
  "slotId": 101,
  "reason": "Regular checkup and consultation"
}

Response 201:
{
  "id": 45,
  "reason": "Regular checkup and consultation",
  "status": "BOOKED",
  "appointmentType": "online",
  "startTime": "2025-11-25T09:00:00.000Z",
  "endTime": "2025-11-25T09:30:00.000Z",
  "createdAt": "2025-11-23T15:30:00.000Z",
  "patient": {
    "id": 1,
    "firstName": "Ahmed",
    "lastName": "Khan",
    "email": "patient@example.com"
  },
  "doctor": {
    "id": 1,
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed.hassan@hospital.com",
    "specialization": "Interventional Cardiology",
    "qualification": "MBBS, FCPS (Cardiology)",
    "experience": 15,
    "departmentName": "Cardiology"
  }
}

Error 400 - Slot Already Booked:
{
  "statusCode": 400,
  "message": "This slot is already booked"
}

Error 400 - Past Slot:
{
  "statusCode": 400,
  "message": "Cannot book past appointment slots"
}
```

#### Get My Appointments
```http
GET /online-appointments/my-appointments
Authorization: Bearer {token}
Role: PATIENT

Query Parameters:
  - status: BOOKED | COMPLETED | CANCELLED | NOT_ATTENDED
  - timeFilter: upcoming | past | all

Examples:
  GET /online-appointments/my-appointments
  GET /online-appointments/my-appointments?timeFilter=upcoming
  GET /online-appointments/my-appointments?status=BOOKED
  GET /online-appointments/my-appointments?status=BOOKED&timeFilter=upcoming

Response 200:
[
  {
    "id": 45,
    "reason": "Regular checkup",
    "status": "BOOKED",
    "appointmentType": "online",
    "startTime": "2025-11-25T09:00:00.000Z",
    "endTime": "2025-11-25T09:30:00.000Z",
    "createdAt": "2025-11-23T15:30:00.000Z",
    "doctor": {
      "id": 1,
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed.hassan@hospital.com",
      "specialization": "Interventional Cardiology",
      "qualification": "MBBS, FCPS (Cardiology)",
      "experience": 15,
      "departmentName": "Cardiology"
    }
  }
]
```

#### Cancel Appointment
```http
PATCH /online-appointments/{appointmentId}/cancel
Authorization: Bearer {token}
Role: PATIENT

Response 200:
{
  "message": "Appointment cancelled successfully",
  "appointment": {
    "id": 45,
    "status": "CANCELLED",
    ...appointment details...
  }
}

Error 400 - Too Late:
{
  "statusCode": 400,
  "message": "Cannot cancel appointment less than 1 hour before scheduled time"
}

Error 400 - Already Cancelled:
{
  "statusCode": 400,
  "message": "Appointment is already cancelled"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Patient profile not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "This slot is already booked"
}
```

---

## Data Models

### Patient Profile
```typescript
{
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  cnic: string;
  dateOfBirth?: Date;
  bloodGroup?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  address?: string;
  medicalHistory?: string;
  familyHistory?: string;
  allergies?: string;
  onboardingDone: boolean;
  onboardedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Doctor (Basic Info)
```typescript
{
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  departmentId: number;
  departmentName: string;
  licenseNumber: string;
  specialization: string;
  qualification: string;
  experience: number;
}
```

### Appointment Slot
```typescript
{
  id: number;
  scheduleId: number;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  isBookable: boolean;
  isBooked: boolean;
}
```

### Appointment
```typescript
{
  id: number;
  reason?: string;
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "NOT_ATTENDED";
  appointmentType: "online";
  startTime: string;
  endTime: string;
  createdAt: string;
  patient: { ... };
  doctor: { ... };
}
```

---

## Testing with Python Client

```bash
cd hospital-backend-client
python patient_portal_test.py
```

The test client will:
1. Login as patient
2. Get and update profile
3. Fetch dashboard statistics
4. Browse doctors and available slots
5. Book an appointment
6. View my appointments
7. Cancel appointment (optional)

---

## User Flow

### 1. First Time User (Onboarding)
```
1. Login → GET /patients/profile (onboardingDone: false)
2. Complete onboarding → PATCH /patients/profile (with all required info)
3. Profile complete → redirect to dashboard
```

### 2. Dashboard View
```
1. GET /patients/dashboard/stats (show stats cards)
2. GET /patients/dashboard/upcoming-appointments?limit=3
3. GET /patients/dashboard/recent-checkups?limit=3
```

### 3. Book Appointment Flow
```
1. GET /appointment-slots/doctors-with-slots (browse all doctors)
2. Select doctor → GET /appointment-slots/doctor/{doctorId}
3. Select slot → POST /online-appointments/book
4. Success → redirect to appointments page
```

### 4. View Appointments
```
1. All → GET /online-appointments/my-appointments
2. Upcoming → GET /online-appointments/my-appointments?timeFilter=upcoming
3. Past → GET /online-appointments/my-appointments?timeFilter=past
```

### 5. Cancel Appointment
```
1. Select appointment
2. PATCH /online-appointments/{id}/cancel
3. Success → refresh appointments list
```

---

## Business Rules

### Appointment Booking
- ✅ Slot must be `isBookable: true`
- ✅ Slot must not be `isBooked: true`
- ✅ Slot must be in the future
- ✅ Patient can only book for themselves
- ✅ Slot is automatically marked as booked after successful booking

### Appointment Cancellation
- ✅ Can only cancel own appointments
- ✅ Cannot cancel less than 1 hour before scheduled time
- ✅ Cannot cancel already completed appointments
- ✅ Cannot cancel already cancelled appointments
- ✅ Slot is automatically freed up after cancellation

### Profile Updates
- ✅ Patient can update their own profile only
- ✅ First profile update sets `onboardingDone: true` and `onboardedAt`
- ✅ Can update multiple times after onboarding

---

## Module Structure

```
src/
├── patient/
│   ├── patient.controller.ts     # Profile & dashboard endpoints
│   ├── patient.service.ts        # Business logic
│   ├── patient.module.ts
│   └── dto/
│       ├── patient.dto.ts
│       └── complete-onboarding.dto.ts
│
├── onlineappointment/
│   ├── onlineappointment.controller.ts   # Book, view, cancel
│   ├── onlineappointment.service.ts
│   ├── onlineappointment.module.ts
│   └── dto/
│       └── online-appointment.dto.ts
│
└── appointmentslot/
    ├── appointmentslot.controller.ts     # Browse slots
    ├── appointmentslot.service.ts
    └── appointmentslot.module.ts
```

---

## Summary

**Total Endpoints: 11**

### Patient Profile (2)
- GET /patients/profile
- PATCH /patients/profile

### Dashboard (3)
- GET /patients/dashboard/stats
- GET /patients/dashboard/upcoming-appointments
- GET /patients/dashboard/recent-checkups

### Appointment Slots (3)
- GET /appointment-slots/doctors-with-slots
- GET /appointment-slots/doctor/:doctorId
- GET /appointment-slots/available

### Online Appointments (3)
- POST /online-appointments/book
- GET /online-appointments/my-appointments
- PATCH /online-appointments/:id/cancel

All endpoints are fully functional and tested! 🎉
