# Patient Portal APIs - Quick Start Guide

## 🚀 Quick Setup

### 1. Start the Backend
```bash
cd hospital-backend
npm run start:dev
```

Backend will run on `http://localhost:3002`

### 2. Run the Test Client
```bash
cd hospital-backend-client
python patient_portal_test.py
```

## 📝 Prerequisites

### Create a Test Patient
Before testing, you need a patient account. Use the receptionist/admin endpoints to register a patient:

```bash
# Login as admin/receptionist first
POST http://localhost:3002/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

# Register a patient
POST http://localhost:3002/patients/register
Authorization: Bearer {admin_token}
{
  "firstName": "Ahmed",
  "lastName": "Khan",
  "email": "patient@example.com",
  "gender": "MALE",
  "cnic": "42101-1234567-1"
}
```

The patient will be created with the default password from `.env`:
```
DEFAULT_PASSWORD=password123
```

### Create Doctor Schedules
For appointment booking to work, doctors must have schedules with available slots:

```bash
# Login as doctor
POST http://localhost:3002/auth/login
{
  "email": "doctor@example.com",
  "password": "password123"
}

# Create a schedule
POST http://localhost:3002/doctor-schedules
Authorization: Bearer {doctor_token}
{
  "from": "2025-11-25T09:00:00.000Z",
  "to": "2025-11-25T17:00:00.000Z",
  "noOfSlots": 16
}
```

## 🧪 Test Scenarios

### Scenario 1: Complete Patient Onboarding
```python
client = PatientPortalClient()
client.login("patient@example.com", "password123")
client.get_profile()  # onboardingDone: false

# Complete onboarding
client.update_profile({
    "dateOfBirth": "1990-05-15",
    "bloodGroup": "B+",
    "phoneNumber": "+92-300-1234567",
    "emergencyContact": "+92-301-7654321",
    "address": "House 123, Street 5, F-7, Islamabad",
    "allergies": "Penicillin",
    "medicalHistory": "No significant history",
    "familyHistory": "Father has diabetes",
    "onboardingDone": True
})
```

### Scenario 2: Browse and Book Appointment
```python
# Get all doctors with available slots
doctors = client.get_all_doctors_with_slots()

# Get specific doctor's slots
doctor_slots = client.get_doctor_available_slots(doctor_id=1)

# Book appointment
client.book_appointment(
    slot_id=101,
    reason="Regular checkup and consultation"
)
```

### Scenario 3: View and Cancel Appointments
```python
# View all appointments
appointments = client.get_my_appointments()

# View upcoming only
upcoming = client.get_my_appointments(time_filter='upcoming')

# Cancel an appointment
client.cancel_appointment(appointment_id=45)
```

### Scenario 4: Dashboard Data
```python
# Get dashboard stats
stats = client.get_dashboard_stats()
# Returns: { upcomingAppointments, completedCheckups, pendingLabTests }

# Get upcoming appointments for dashboard
upcoming = client.get_upcoming_appointments(limit=3)

# Get recent checkups for dashboard
checkups = client.get_recent_checkups(limit=3)
```

## 🔍 Manual Testing with cURL

### Login
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3002/patients/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get All Doctors with Slots
```bash
curl -X GET http://localhost:3002/appointment-slots/doctors-with-slots \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Book Appointment
```bash
curl -X POST http://localhost:3002/online-appointments/book \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "slotId": 101,
    "reason": "Regular checkup"
  }'
```

### Get My Appointments
```bash
curl -X GET "http://localhost:3002/online-appointments/my-appointments?timeFilter=upcoming" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cancel Appointment
```bash
curl -X PATCH http://localhost:3002/online-appointments/45/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Testing with Postman

Import this collection:

```json
{
  "info": {
    "name": "Patient Portal APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{patientToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3002"
    },
    {
      "key": "patientToken",
      "value": ""
    },
    {
      "key": "patientId",
      "value": "1"
    }
  ]
}
```

## 🐛 Troubleshooting

### Issue: "Patient profile not found"
**Solution:** Make sure you're logged in as a user with PATIENT role.

### Issue: "This slot is already booked"
**Solution:** The slot was booked by another patient. Choose a different slot.

### Issue: "Cannot book past appointment slots"
**Solution:** The slot's start time is in the past. Choose a future slot.

### Issue: "Cannot cancel appointment less than 1 hour before"
**Solution:** Cancellation must be done at least 1 hour before appointment time.

### Issue: "No available slots"
**Solution:** Doctors need to create schedules first. See "Create Doctor Schedules" above.

## 📈 Expected Test Results

When running `patient_portal_test.py`, you should see:

```
============================================================
PATIENT PORTAL API TEST SUITE
============================================================

1. AUTHENTICATION
------------------------------------------------------------
Status: 200
✅ Login successful

2. PATIENT PROFILE
------------------------------------------------------------
Status: 200
✅ Profile retrieved
✅ Profile updated

3. DASHBOARD DATA
------------------------------------------------------------
Status: 200
✅ Stats retrieved
   Upcoming Appointments: 1
   Completed Checkups: 0
   Pending Lab Tests: 0

4. BROWSE DOCTORS & SLOTS
------------------------------------------------------------
Status: 200
✅ Retrieved 12 doctors
✅ Retrieved slots

5. BOOK APPOINTMENT
------------------------------------------------------------
Status: 201
✅ Appointment booked successfully

6. VIEW MY APPOINTMENTS
------------------------------------------------------------
Status: 200
✅ Retrieved 1 appointments

7. CANCEL APPOINTMENT
------------------------------------------------------------
Status: 200
✅ Appointment cancelled successfully

============================================================
TEST SUITE COMPLETED
============================================================
```

## 🎯 Key Features Tested

- ✅ Patient authentication
- ✅ Profile management & onboarding
- ✅ Dashboard statistics
- ✅ Browse doctors with available slots
- ✅ View doctor-specific slots
- ✅ Filter slots by department
- ✅ Book appointments
- ✅ View appointments (all, upcoming, past)
- ✅ Cancel appointments
- ✅ Error handling for invalid operations

## 📚 Next Steps

1. **Frontend Integration**: Use the APIs in the React patient portal
2. **Add More Test Data**: Create more doctors and schedules
3. **Test Edge Cases**: Try booking same slot twice, canceling too late, etc.
4. **Performance Testing**: Test with multiple concurrent users
5. **Integration Testing**: Test complete user journeys end-to-end

## 🔐 Security Notes

- All endpoints require authentication
- Patients can only access their own data
- Patients can only book/cancel their own appointments
- Role-based access control enforced
- Slot booking has race condition protection (transaction)

---

**Ready to test?** Run:
```bash
python patient_portal_test.py
```

Happy testing! 🎉
