# Patient Portal API Test Results

**Test Date:** November 23, 2025  
**Backend URL:** http://localhost:3002  
**Test Patient:** patient@hospital.com

---

## ✅ Test Summary

All 11 Patient Portal APIs tested successfully:

1. ✅ **Authentication** - POST `/auth/login`
2. ✅ **Get Profile** - GET `/patients/profile`
3. ✅ **Update Profile** - PATCH `/patients/profile`
4. ✅ **Dashboard Stats** - GET `/patients/dashboard/stats`
5. ✅ **Dashboard Upcoming Appointments** - GET `/patients/dashboard/upcoming-appointments`
6. ✅ **Dashboard Recent Checkups** - GET `/patients/dashboard/recent-checkups`
7. ✅ **Browse All Doctors** - GET `/appointment-slots/doctors-with-slots`
8. ✅ **Get Doctor Slots** - GET `/appointment-slots/doctor/:doctorId`
9. ✅ **Book Appointment** - POST `/online-appointments/book`
10. ✅ **View My Appointments** - GET `/online-appointments/my-appointments`
11. ✅ **Cancel Appointment** - PATCH `/online-appointments/:id/cancel`

---

## 📊 API Response Structures

### 1. Authentication (Login)

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "patient@hospital.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Get Patient Profile

**Endpoint:** `GET /patients/profile`  
**Auth Required:** Yes (Bearer Token)

**Response (200):**
```json
{
  "id": 4,
  "userId": 8,
  "firstName": "Ahmed",
  "lastName": "Khan",
  "email": "patient@hospital.com",
  "gender": "MALE",
  "cnic": "42101-1234567-1",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "bloodGroup": "B+",
  "medicalHistory": "No significant history",
  "familyHistory": "Father has diabetes",
  "allergies": "Penicillin",
  "address": "House 123, Street 5, F-7, Islamabad",
  "phoneNumber": "+92-300-1234567",
  "emergencyContact": "+92-301-7654321",
  "onboardingDone": true,
  "onboardedAt": "2025-11-23T09:18:07.280Z",
  "createdAt": "2025-11-23T09:16:12.909Z",
  "updatedAt": "2025-11-23T09:18:07.281Z"
}
```

**Fields:**
- `id` - Patient ID
- `userId` - Associated user ID
- `firstName`, `lastName` - Patient name
- `email` - Patient email
- `gender` - MALE, FEMALE, or OTHER
- `cnic` - National ID card number
- `dateOfBirth` - ISO 8601 date string
- `bloodGroup` - Blood type (e.g., "B+", "O-", "AB+")
- `medicalHistory` - Past medical conditions
- `familyHistory` - Family medical history
- `allergies` - Known allergies
- `address` - Residential address
- `phoneNumber` - Contact phone
- `emergencyContact` - Emergency contact number
- `onboardingDone` - Whether patient completed initial profile
- `onboardedAt` - Timestamp of profile completion
- `createdAt`, `updatedAt` - Record timestamps

---

### 3. Dashboard Statistics

**Endpoint:** `GET /patients/dashboard/stats`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "upcomingAppointments": 3,
  "completedCheckups": 0,
  "pendingLabTests": 0
}
```

**Fields:**
- `upcomingAppointments` - Count of future appointments
- `completedCheckups` - Count of past checkups
- `pendingLabTests` - Count of lab tests awaiting results

---

### 4. Dashboard Upcoming Appointments

**Endpoint:** `GET /patients/dashboard/upcoming-appointments?limit=3`  
**Auth Required:** Yes  
**Query Parameters:**
- `limit` (optional) - Number of appointments to return (default: 5)

**Response (200):**
```json
[
  {
    "id": 1,
    "reason": "Regular checkup and consultation",
    "status": "BOOKED",
    "startTime": "2025-11-24T09:00:00.000Z",
    "endTime": "2025-11-24T10:00:00.000Z",
    "doctor": {
      "firstName": "Ahmed",
      "lastName": "Ali",
      "specialization": "Cardiology",
      "departmentName": "Cardiology Department"
    }
  }
]
```

**Doctor Object Fields:**
- `firstName`, `lastName` - Doctor name
- `specialization` - Medical specialty
- `departmentName` - Department name

---

### 5. Browse All Doctors with Available Slots

**Endpoint:** `GET /appointment-slots/doctors-with-slots`  
**Auth Required:** Yes

**Response (200):**
```json
[
  {
    "id": 2,
    "userId": 4,
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed.ali@hospital.com",
    "gender": "MALE",
    "departmentId": 1,
    "departmentName": "Cardiology Department",
    "licenseNumber": "DOC12345",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD Cardiology, Fellowship",
    "experience": 6,
    "availableSlotsCount": 5,
    "upcomingSlots": [
      {
        "id": 4,
        "scheduleId": 1,
        "startTime": "2025-11-24T12:00:00.000Z",
        "endTime": "2025-11-24T13:00:00.000Z"
      }
    ]
  }
]
```

**Fields:**
- `id` - Doctor ID
- `firstName`, `lastName` - Doctor name
- `email` - Doctor email
- `departmentId`, `departmentName` - Department info
- `licenseNumber` - Medical license number
- `specialization` - Area of expertise
- `qualification` - Medical degrees
- `experience` - Years of experience
- `availableSlotsCount` - Total available appointment slots
- `upcomingSlots` - Array of next 5 available slots

---

### 6. Get Doctor Available Slots

**Endpoint:** `GET /appointment-slots/doctor/:doctorId`  
**Auth Required:** Yes  
**Path Parameters:**
- `doctorId` - The doctor's ID

**Response (200):**
```json
{
  "doctor": {
    "id": 2,
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed.ali@hospital.com",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD Cardiology, Fellowship",
    "experience": 6,
    "departmentId": 1,
    "departmentName": "Cardiology Department",
    "licenseNumber": "DOC12345"
  },
  "slots": [
    {
      "id": 4,
      "scheduleId": 1,
      "startTime": "2025-11-24T12:00:00.000Z",
      "endTime": "2025-11-24T13:00:00.000Z",
      "isBookable": true,
      "isBooked": false
    }
  ]
}
```

**Slot Fields:**
- `id` - Slot ID (used for booking)
- `scheduleId` - Parent schedule ID
- `startTime`, `endTime` - Appointment window (ISO 8601)
- `isBookable` - Whether slot can be booked
- `isBooked` - Whether slot is already booked

---

### 7. Book Appointment

**Endpoint:** `POST /online-appointments/book`  
**Auth Required:** Yes

**Request:**
```json
{
  "slotId": 4,
  "reason": "Regular checkup and consultation"
}
```

**Request Fields:**
- `slotId` (required) - The slot ID from available slots
- `reason` (optional) - Reason for appointment

**Response (201):**
```json
{
  "id": 4,
  "reason": "Regular checkup and consultation",
  "status": "BOOKED",
  "appointmentType": "online",
  "startTime": "2025-11-24T12:00:00.000Z",
  "endTime": "2025-11-24T13:00:00.000Z",
  "createdAt": "2025-11-23T09:26:27.062Z",
  "patient": {
    "id": 4,
    "firstName": "Ahmed",
    "lastName": "Khan",
    "email": "patient@hospital.com"
  },
  "doctor": {
    "id": 2,
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed.ali@hospital.com",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD Cardiology, Fellowship",
    "experience": 6,
    "departmentName": "Cardiology Department"
  }
}
```

**Response Fields:**
- `id` - Online appointment ID
- `status` - BOOKED, COMPLETED, CANCELLED, NOT_ATTENDED
- `appointmentType` - "online" or "walk-in"
- `startTime`, `endTime` - Appointment window
- `patient` - Patient details
- `doctor` - Doctor details

---

### 8. View My Appointments

**Endpoint:** `GET /online-appointments/my-appointments`  
**Auth Required:** Yes  
**Query Parameters:**
- `status` (optional) - Filter by BOOKED, COMPLETED, CANCELLED, NOT_ATTENDED
- `timeFilter` (optional) - Filter by 'upcoming', 'past', or 'all'

**Example:** `GET /online-appointments/my-appointments?timeFilter=upcoming`

**Response (200):**
```json
[
  {
    "id": 4,
    "reason": "Regular checkup and consultation",
    "status": "BOOKED",
    "appointmentType": "online",
    "startTime": "2025-11-24T12:00:00.000Z",
    "endTime": "2025-11-24T13:00:00.000Z",
    "createdAt": "2025-11-23T09:26:27.062Z",
    "doctor": {
      "id": 2,
      "firstName": "Ahmed",
      "lastName": "Ali",
      "email": "ahmed.ali@hospital.com",
      "specialization": "Cardiology",
      "qualification": "MBBS, MD Cardiology, Fellowship",
      "experience": 6,
      "departmentName": "Cardiology Department"
    }
  }
]
```

---

### 9. Cancel Appointment

**Endpoint:** `PATCH /online-appointments/:id/cancel`  
**Auth Required:** Yes  
**Path Parameters:**
- `id` - The online appointment ID

**Business Rules:**
- Must be cancelled at least 1 hour before appointment time
- Can only cancel BOOKED appointments
- Cannot cancel COMPLETED or CANCELLED appointments

**Response (200):**
```json
{
  "id": 4,
  "reason": "Regular checkup and consultation",
  "status": "CANCELLED",
  "appointmentType": "online",
  "startTime": "2025-11-24T12:00:00.000Z",
  "endTime": "2025-11-24T13:00:00.000Z",
  "createdAt": "2025-11-23T09:26:27.062Z",
  "doctor": {
    "id": 2,
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed.ali@hospital.com",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD Cardiology, Fellowship",
    "experience": 6,
    "departmentName": "Cardiology Department"
  }
}
```

**Error Response (400) - Too Late to Cancel:**
```json
{
  "message": "Cannot cancel appointment less than 1 hour before the scheduled time",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 🔐 Authentication

All endpoints (except login) require JWT authentication:

**Header:**
```
Authorization: Bearer <access_token>
```

The token is obtained from the login endpoint and expires after 1 hour.

---

## ⚠️ Common Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "message": "Credentials incorrect",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "Patient profile not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 400 Bad Request
```json
{
  "message": ["slotId must be a number", "slotId should not be empty"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 📝 Notes

1. **Date/Time Format**: All timestamps use ISO 8601 format with UTC timezone
2. **Slot Booking**: Slots are automatically marked as booked when appointment is created
3. **Slot Release**: Cancelled appointments free up their slots automatically
4. **Patient ID**: Not required in booking request - extracted from JWT token
5. **Dashboard Limits**: Default limit is 5 items, can be overridden with query parameter
6. **Appointment Filters**: Can combine status and timeFilter for precise queries

---

## 🧪 Test Execution

**Test Script:** `patient_portal_test_auto.py`  
**Setup Script:** `setup_test_patient.py`

**To run tests:**
```bash
# Start backend
cd hospital-backend
npm run start:dev

# Setup test data
cd hospital-backend-client
python setup_test_patient.py

# Run tests
python patient_portal_test_auto.py
```

---

**Generated:** November 23, 2025  
**All APIs Verified:** ✅ Working as expected
