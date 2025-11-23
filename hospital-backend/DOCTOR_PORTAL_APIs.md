# Doctor Portal APIs - Backend Implementation

## Overview
All APIs for the doctor portal have been implemented in the hospital-backend service, moving away from the microservice architecture.

## Authentication
All doctor-specific endpoints require:
- JWT token in Authorization header: `Bearer <token>`
- User must have DOCTOR role

---

## 1. Doctor Profile & Dashboard APIs

### Get Doctor Profile
```
GET /doctors/profile
Auth: Required (DOCTOR)
```
Returns the logged-in doctor's profile information including department and specialization.

**Response:**
```json
{
  "id": 1,
  "firstName": "Dr. Aisha",
  "lastName": "Khan",
  "email": "dr.aisha@hospital.com",
  "gender": "FEMALE",
  "cnic": "12345-1234567-1",
  "licenseNumber": "LIC-2015-00123",
  "specialization": "General Practitioner",
  "experience": 8,
  "qualification": "MBBS, MD",
  "departmentName": "General Medicine",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Get Dashboard Stats
```
GET /doctors/dashboard/stats
Auth: Required (DOCTOR)
```
Returns statistics for the doctor's dashboard.

**Response:**
```json
{
  "schedules": 2,
  "bookedSlots": 4,
  "availableSlots": 8,
  "unbookableSlots": 0,
  "checkups": 3,
  "todayAppointments": 2
}
```

---

### Get Upcoming Appointments
```
GET /doctors/dashboard/upcoming-appointments?limit=5
Auth: Required (DOCTOR)
```
Returns upcoming appointments for the logged-in doctor.

**Query Parameters:**
- `limit` (optional): Number of appointments to return (default: 5)

**Response:**
```json
[
  {
    "id": 1,
    "startTime": "2024-12-18T09:00:00.000Z",
    "endTime": "2024-12-18T09:30:00.000Z",
    "reason": "Regular checkup",
    "patientName": "Ahmed Hassan",
    "slotId": 1
  }
]
```

---

### Get Recent Checkups
```
GET /doctors/dashboard/recent-checkups?limit=5
Auth: Required (DOCTOR)
```
Returns recent checkups performed by the logged-in doctor.

**Query Parameters:**
- `limit` (optional): Number of checkups to return (default: 5)

**Response:**
```json
[
  {
    "id": 1,
    "createdAt": "2024-12-10T09:45:00.000Z",
    "diagnosisPreview": "Tension headache. Likely stress-induced. No signs of serious underlying…",
    "slotStart": "2024-12-10T09:00:00.000Z",
    "bloodPressure": "120/80",
    "temperature": "98.6",
    "heartRate": "72",
    "bloodSugar": "110",
    "patientName": "Ahmed Hassan"
  }
]
```

---

## 2. Appointments APIs

### Get Booked Appointments
```
GET /doctors/appointments/booked
Auth: Required (DOCTOR)
```
Returns all booked appointments for the logged-in doctor with patient details.

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "slotId": 1,
    "scheduleId": 1,
    "startTime": "2024-12-18T09:00:00.000Z",
    "endTime": "2024-12-18T09:30:00.000Z",
    "reason": "Regular checkup",
    "status": "scheduled",
    "patient": {
      "id": 1,
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "bloodGroup": "O+",
      "medicalHistory": "Hypertension, controlled with medication",
      "allergies": "None"
    },
    "createdAt": "2024-12-10T08:00:00.000Z"
  }
]
```

---

## 3. Schedule APIs

### Create Schedule
```
POST /doctorschedules
Auth: Required (DOCTOR)
```
Creates a new schedule with appointment slots for the logged-in doctor.

**Request Body:**
```json
{
  "from": "2024-12-18T09:00:00.000Z",
  "to": "2024-12-18T12:00:00.000Z",
  "noOfSlots": 6
}
```

**Response:**
```json
{
  "id": 1,
  "doctorId": 1,
  "from": "2024-12-18T09:00:00.000Z",
  "to": "2024-12-18T12:00:00.000Z",
  "noOfSlots": 6,
  "createdAt": "2024-12-15T10:00:00.000Z",
  "updatedAt": "2024-12-15T10:00:00.000Z",
  "deletedAt": null
}
```

---

### Get My Schedules
```
GET /doctorschedules
Auth: Required (DOCTOR)
```
Returns all schedules with appointment slots for the logged-in doctor.

**Response:**
```json
[
  {
    "id": 1,
    "doctorId": 1,
    "from": "2024-12-18T09:00:00.000Z",
    "to": "2024-12-18T12:00:00.000Z",
    "noOfSlots": 6,
    "createdAt": "2024-12-15T10:00:00.000Z",
    "updatedAt": "2024-12-15T10:00:00.000Z",
    "deletedAt": null,
    "appointmentSlots": [
      {
        "id": 1,
        "scheduleId": 1,
        "startTime": "2024-12-18T09:00:00.000Z",
        "endTime": "2024-12-18T09:30:00.000Z",
        "isBookable": true,
        "isBooked": true,
        "createdAt": "2024-12-15T10:00:00.000Z",
        "updatedAt": "2024-12-15T10:00:00.000Z",
        "deletedAt": null
      }
    ]
  }
]
```

---

### Get Schedule by ID
```
GET /doctorschedules/:id
Auth: Required (DOCTOR)
```
Returns a specific schedule with all its appointment slots.

**Response:** Same as single schedule object above.

---

### Delete Schedule
```
DELETE /doctorschedules/:id
Auth: Required (DOCTOR)
```
Soft deletes a schedule (only if no appointments exist).

**Response:**
```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

---

## 4. Checkup APIs

### Create Checkup
```
POST /checkups
Auth: Required (DOCTOR)
```
Creates a new checkup record for an appointment.

**Request Body:**
```json
{
  "appointmentId": 1,
  "bloodPressure": "120/80",
  "temperature": "98.6",
  "heartRate": "72",
  "bloodSugar": "110",
  "symptoms": "Mild headache, fatigue for the past 2 days",
  "diagnosis": "Tension headache. Likely stress-induced",
  "notes": "Patient advised to maintain healthy lifestyle",
  "medications": [
    {
      "drugId": 1,
      "dosePerIntake": "500mg",
      "timesPerDay": 2,
      "totalDays": 3,
      "instructions": "Take after meals with plenty of water"
    }
  ],
  "additionalMedications": "Continue current maintenance medications",
  "recommendedLabTestIds": [1, 4],
  "additionalTests": "HbA1c if symptoms persist"
}
```

**Response:**
```json
{
  "id": 1,
  "appointmentId": 1,
  "bloodPressure": "120/80",
  "temperature": "98.6",
  "heartRate": "72",
  "bloodSugar": "110",
  "symptoms": "Mild headache, fatigue for the past 2 days",
  "diagnosis": "Tension headache. Likely stress-induced",
  "notes": "Patient advised to maintain healthy lifestyle",
  "prescription": {
    "id": 1,
    "additionalMedications": "Continue current maintenance medications",
    "medications": [
      {
        "id": 1,
        "drug": {
          "id": 1,
          "name": "Aspirin",
          "strength": "500mg",
          "dosageForm": "Tablet",
          "formulaName": "Acetylsalicylic Acid"
        },
        "dosePerIntake": "500mg",
        "timesPerDay": 2,
        "totalDays": 3,
        "instructions": "Take after meals with plenty of water"
      }
    ]
  },
  "checkupTestRecommendation": {
    "id": 1,
    "additionalTests": "HbA1c if symptoms persist",
    "recommendedLabTests": [
      {
        "id": 1,
        "labTest": {
          "id": 1,
          "name": "Complete Blood Count (CBC)"
        }
      }
    ]
  },
  "appointment": {
    "id": 1,
    "patientId": 1,
    "slotId": 1,
    "reason": "Regular checkup",
    "createdAt": "2024-12-10T08:00:00.000Z",
    "slot": {
      "startTime": "2024-12-18T09:00:00.000Z",
      "endTime": "2024-12-18T09:30:00.000Z"
    },
    "patient": {
      "id": 1,
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "bloodGroup": "O+",
      "medicalHistory": "Hypertension, controlled with medication",
      "allergies": "None"
    }
  },
  "createdAt": "2024-12-18T09:45:00.000Z",
  "updatedAt": "2024-12-18T09:45:00.000Z"
}
```

---

### Get Checkup History
```
GET /checkups/history
Auth: Required (DOCTOR)
```
Returns all checkups created by the logged-in doctor.

**Response:** Array of checkup objects (same structure as create response).

---

### Get Checkup by ID
```
GET /checkups/:id
Auth: Required (DOCTOR)
```
Returns a specific checkup by ID (only if it belongs to the logged-in doctor).

**Response:** Single checkup object (same structure as create response).

---

## 5. Admin-Only Doctor Management APIs

### Register Doctor
```
POST /doctors/register
Auth: Required (ADMIN)
```
Registers a new doctor in the system.

### Update Doctor
```
PATCH /doctors/:id
Auth: Required (ADMIN)
```
Updates doctor information.

### Get All Doctors
```
GET /doctors
Auth: Required (ADMIN)
```
Returns all doctors in the system.

### Delete Doctor
```
DELETE /doctors/:id
Auth: Required (ADMIN)
```
Deletes a doctor from the system.

### Get Doctors by Department
```
GET /doctors/department/:departmentName
Auth: Required (ADMIN)
```
Returns all doctors in a specific department.

---

## 6. Supporting APIs (Already Existing)

### Get All Drugs
```
GET /drugs
Auth: Required (ADMIN)
```
Returns all active drugs in the system for prescription.

### Get All Lab Tests
```
GET /lab-tests
Auth: Required (ADMIN)
```
Returns all active lab tests in the system for recommendations.

---

## Migration Notes

### Changes Made:
1. **Moved from Microservices to Monolith**: All schedule and checkup functionality now in `hospital-backend`
2. **New Endpoints**: Added doctor dashboard, appointments, and profile endpoints
3. **Removed Dependencies**: No longer requires `checkups-microservice`
4. **Database**: All operations use the same Prisma instance

### Frontend Integration:
Replace mock data calls in:
- `hospital-frontend/lib/mock-data.ts`
- `hospital-frontend/lib/mock-fetch.ts`

With actual API calls to these endpoints using the JWT token from authentication.

### Environment Variables:
No microservice URLs needed anymore. Just ensure:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
DEFAULT_PASSWORD="default-password-for-new-users"
```
