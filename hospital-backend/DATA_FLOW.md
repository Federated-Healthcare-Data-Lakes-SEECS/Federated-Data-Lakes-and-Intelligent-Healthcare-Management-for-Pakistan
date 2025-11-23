# Data Flow & Structure - Doctor Portal

## Overview
This document explains how data flows through the doctor portal system.

---

## 1. Authentication Flow

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ POST /auth/login
       │ { email, password }
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │ Verify credentials
       │ Generate JWT token
       ▼
┌─────────────┐
│   Database  │
└──────┬──────┘
       │ Return user + roles
       ▼
┌─────────────┐
│   Frontend  │ Store token
└─────────────┘ Navigate to dashboard
```

---

## 2. Dashboard Data Flow

```
┌─────────────────────────────────────────┐
│          Doctor Dashboard               │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┬──────────┬──────────┐
    │                 │          │          │
    ▼                 ▼          ▼          ▼
┌─────────┐  ┌────────────┐  ┌──────┐  ┌──────┐
│  Stats  │  │ Upcoming   │  │Recent│  │Profile│
│         │  │Appointments│  │Checks│  │      │
└─────────┘  └────────────┘  └──────┘  └──────┘
```

### Stats Calculation:
```typescript
{
  schedules: COUNT(doctor_schedules WHERE deletedAt IS NULL),
  bookedSlots: COUNT(appointment_slots WHERE isBooked = true),
  availableSlots: COUNT(appointment_slots WHERE isBookable = true AND isBooked = false),
  unbookableSlots: COUNT(appointment_slots WHERE isBookable = false AND isBooked = false),
  checkups: COUNT(checkups for this doctor),
  todayAppointments: COUNT(appointments WHERE slot.startTime is today)
}
```

---

## 3. Schedule Creation Flow

```
Frontend: Create Schedule Form
    │
    │ { from, to, noOfSlots }
    ▼
Backend: POST /doctorschedules
    │
    ├─ Validate: from < to
    ├─ Validate: noOfSlots > 0
    ├─ Check for overlapping schedules
    ├─ Calculate slot duration
    │
    ▼
Database Transaction:
    ├─ 1. Create DoctorSchedule
    │
    └─ 2. Create AppointmentSlots[]
        │
        └─ Generate N slots with equal duration
           between from and to
```

### Slot Generation Logic:
```typescript
totalMinutes = (to - from) / (1000 * 60)
slotDuration = totalMinutes / noOfSlots

for (i = 0; i < noOfSlots; i++) {
  startTime = from + (i * slotDuration * 60000)
  endTime = startTime + (slotDuration * 60000)
  
  create AppointmentSlot {
    scheduleId,
    startTime,
    endTime,
    isBookable: true,
    isBooked: false
  }
}
```

---

## 4. Appointment Booking Flow (Patient Side - Not Implemented Yet)

```
Patient selects available slot
    │
    ▼
Backend: Create Appointment
    │
    ├─ Verify slot exists
    ├─ Verify isBookable = true
    ├─ Verify isBooked = false
    │
    ▼
Database Transaction:
    ├─ 1. Create Appointment
    │
    └─ 2. Update AppointmentSlot
        └─ Set isBooked = true
```

---

## 5. Checkup Creation Flow

```
Doctor views booked appointment
    │
    ▼
Doctor fills checkup form:
    ├─ Vitals (BP, temp, heart rate, blood sugar)
    ├─ Symptoms
    ├─ Diagnosis
    ├─ Notes
    ├─ Medications []
    └─ Lab Test Recommendations []
    │
    ▼
Backend: POST /checkups
    │
    ├─ Verify appointment exists
    ├─ Verify appointment belongs to doctor
    ├─ Verify no existing checkup
    ├─ Validate drugs exist
    └─ Validate lab tests exist
    │
    ▼
Database Transaction:
    │
    ├─ 1. Create Prescription
    │   └─ additionalMedications
    │
    ├─ 2. Create Medications[]
    │   └─ drugId, dosePerIntake, timesPerDay, totalDays, instructions
    │
    ├─ 3. Create CheckupTestRecommendation
    │   └─ additionalTests
    │
    ├─ 4. Create RecommendedLabTests[]
    │   └─ labTestId
    │
    └─ 5. Create Checkup
        └─ Link to appointment, prescription, and test recommendation
```

---

## 6. Database Relationships

```
User
 │
 └─► Doctor
      │
      ├─► DoctorSchedule (1:N)
      │    │
      │    └─► AppointmentSlot (1:N)
      │         │
      │         └─► Appointment (1:1)
      │              │
      │              ├─► Patient (N:1)
      │              ├─► OnlineAppointment (1:1)
      │              ├─► WalkinAppointment (1:1)
      │              └─► Checkup (1:1)
      │                   │
      │                   ├─► Prescription (1:1)
      │                   │    │
      │                   │    └─► Medication (1:N)
      │                   │         │
      │                   │         └─► Drug (N:1)
      │                   │
      │                   └─► CheckupTestRecommendation (1:1)
      │                        │
      │                        └─► RecommendedLabTest (1:N)
      │                             │
      │                             └─► LabTest (N:1)
```

---

## 7. API Response Structures

### Dashboard Stats
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

### Booked Appointment
```json
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
    "medicalHistory": "Hypertension",
    "allergies": "None"
  },
  "createdAt": "2024-12-10T08:00:00.000Z"
}
```

### Schedule with Slots
```json
{
  "id": 1,
  "doctorId": 1,
  "from": "2024-12-18T09:00:00.000Z",
  "to": "2024-12-18T12:00:00.000Z",
  "noOfSlots": 6,
  "appointmentSlots": [
    {
      "id": 1,
      "scheduleId": 1,
      "startTime": "2024-12-18T09:00:00.000Z",
      "endTime": "2024-12-18T09:30:00.000Z",
      "isBookable": true,
      "isBooked": true
    },
    // ... more slots
  ]
}
```

### Complete Checkup
```json
{
  "id": 1,
  "appointmentId": 1,
  "bloodPressure": "120/80",
  "temperature": "98.6",
  "heartRate": "72",
  "bloodSugar": "110",
  "symptoms": "Headache, fatigue",
  "diagnosis": "Tension headache",
  "notes": "Advised rest",
  "prescription": {
    "id": 1,
    "additionalMedications": null,
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
        "instructions": "Take after meals"
      }
    ]
  },
  "checkupTestRecommendation": {
    "id": 1,
    "additionalTests": null,
    "recommendedLabTests": [
      {
        "id": 1,
        "labTest": {
          "id": 1,
          "name": "Complete Blood Count"
        }
      }
    ]
  },
  "appointment": {
    "id": 1,
    "patientId": 1,
    "slotId": 1,
    "reason": "Regular checkup",
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
      "medicalHistory": "Hypertension",
      "allergies": "None"
    }
  }
}
```

---

## 8. State Management in Frontend

### Component Hierarchy
```
DoctorPortal
│
├─ DoctorNavigation
│
└─ Main Content (based on currentPage)
    │
    ├─ DashboardPage
    │   ├─ StatsCards (from /doctors/dashboard/stats)
    │   ├─ TodayAppointments (from /doctors/dashboard/upcoming-appointments)
    │   └─ RecentCheckups (from /doctors/dashboard/recent-checkups)
    │
    ├─ SchedulesPage
    │   ├─ ScheduleList (from /doctorschedules)
    │   └─ CreateScheduleDialog
    │
    ├─ AppointmentsPage
    │   ├─ AppointmentsList (from /doctors/appointments/booked)
    │   └─ CheckupForm
    │       ├─ VitalsSection
    │       ├─ SymptomsSection
    │       ├─ DiagnosisSection
    │       ├─ PrescriptionSection (drugs from /drugs)
    │       └─ LabTestsSection (tests from /lab-tests)
    │
    └─ HistoryPage
        ├─ CheckupList (from /checkups/history)
        └─ CheckupDetails
            ├─ PatientInfo
            ├─ VitalsCard
            ├─ ClinicalInfo
            ├─ PrescriptionCard
            └─ LabTestsCard
```

---

## 9. Frontend Data Fetching Pattern

```typescript
// 1. On component mount, fetch data
useEffect(() => {
  loadDashboardData();
}, []);

// 2. Loading function
async function loadDashboardData() {
  setLoading(true);
  try {
    const [stats, upcoming, recent] = await Promise.all([
      doctorAPI.getStats(),
      doctorAPI.getUpcomingAppointments(5),
      doctorAPI.getRecentCheckups(5)
    ]);
    setStats(stats);
    setUpcoming(upcoming);
    setRecent(recent);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

// 3. Handle mutations
async function createCheckup(data) {
  try {
    await checkupAPI.create(data);
    // Refresh data
    loadDashboardData();
    // Navigate or show success
  } catch (error) {
    setError(error.message);
  }
}
```

---

## 10. Security Considerations

### Token Storage
- Store JWT in httpOnly cookie (backend sets it)
- Or store in localStorage with XSS protection
- Include in Authorization header for all requests

### API Authorization
- All endpoints check JWT validity
- Doctor endpoints verify user has DOCTOR role
- Resource ownership verified (doctor can only access their own data)

### Data Validation
- Backend validates all input data
- Frontend validates before submission
- Database constraints ensure data integrity

---

## 11. Error Handling

### Common Error Codes
- `401 Unauthorized` - Invalid/expired token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `400 Bad Request` - Validation failed
- `409 Conflict` - Duplicate/conflicting data

### Frontend Error Handling
```typescript
try {
  const result = await api.call();
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
    router.push('/login');
  } else if (error.status === 403) {
    // Show permission error
    showError('You do not have permission');
  } else {
    // Show generic error
    showError(error.message);
  }
}
```
