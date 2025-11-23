# Quick Test Guide: Doctor Portal with Real APIs

## Prerequisites

1. **Backend Running**: `cd hospital-backend && npm run start:dev` (port 3002)
2. **Database**: PostgreSQL running with seeded data
3. **Frontend Running**: `cd hospital-frontend && npm run dev` (port 3000)

## Test Credentials

From `comprehensive_test.py` results:

- **Doctor**: `ahmed.ali@hospital.com` / `password123`
- **Default Doctor**: `doctor@hospital.com` / `password123`
- **Admin**: `admin@hospital.com` / `admin123456`

## Test Workflow

### 1. Dashboard Page (`/doctor/dashboard`)

**What to Test**:
- ✅ Doctor name displays correctly (from `getDoctorProfile()`)
- ✅ Stats cards show real numbers:
  - Schedules count
  - Booked slots count
  - Available slots count
  - Blocked slots count
  - Checkups count
  - Today's appointments count
- ✅ "Today's Appointments" section (may be empty if no appointments for today)
- ✅ "Recent Checkups" section (may be empty initially)

**Expected Behavior**:
- Shows loading state initially
- Displays actual data from backend
- Empty states show appropriate messages

---

### 2. Schedules Page (`/doctor/schedules`)

**What to Test**:

#### Create Schedule
1. Click "New Schedule" button
2. Fill form:
   - Date: Tomorrow's date
   - Start: 09:00
   - End: 17:00
   - Slots: 8
3. Preview shows 8 slots (1-hour each)
4. Click "Create"
5. ✅ Success alert appears
6. ✅ Schedule list refreshes automatically
7. ✅ New schedule shows in list with 8 appointment slots

#### View Schedule
- ✅ Schedule card shows:
  - Date in format: "Mon, Nov 24, 2025"
  - Time range: "09:00 AM - 05:00 PM"
  - Slot counts: "8 slots", "0 booked", "8 available", "0 blocked"
- ✅ All 8 slots displayed in grid
- ✅ Each slot shows:
  - Start time (09:00 AM)
  - End time (10:00 AM)
  - Status badge (Available)

#### Delete Schedule
1. Click delete button (trash icon)
2. Confirm dialog appears
3. ✅ Schedule deleted
4. ✅ Success alert
5. ✅ List refreshes

**Test Overlap Validation**:
1. Create schedule: Nov 24, 09:00-17:00
2. Try to create: Nov 24, 10:00-12:00
3. ✅ Should show error: "Doctor already has a schedule in this time range"

---

### 3. Appointments Page (`/doctor/appointments`)

**What to Test**:

#### View Booked Appointments
- ✅ Shows loading state initially
- ✅ List displays all booked appointments from `getBookedAppointments()`
- ✅ Each appointment card shows:
  - Patient name
  - Patient age (if dateOfBirth available)
  - Blood group badge
  - Status badge
  - Time range
  - Date
  - Reason badge
  - "Perform Checkup" button

#### If No Appointments:
- ✅ Shows empty state: "No booked appointments"

#### Perform Checkup

**Note**: This will fail if no appointments exist in database. To test fully:
1. Use receptionist/patient portal to book an appointment first
2. Then select it in doctor portal

**Checkup Form**:
1. Click "Perform Checkup" on an appointment
2. ✅ Patient info header shows:
   - Patient name
   - Age
   - Blood group
   - Appointment time
   - Medical history
   - Allergies
3. Fill vital signs:
   - Blood Pressure: "120/80"
   - Temperature: "98.6"
   - Heart Rate: "75"
   - Blood Sugar: "95"
4. Fill diagnosis:
   - Symptoms: "Mild fever, headache"
   - Diagnosis: "Common cold, viral infection"
   - Notes: "Rest and hydration recommended"

#### Add Medications:
1. Select drug from dropdown (e.g., "Paracetamol")
2. Fill prescription:
   - Dosage: "500mg"
   - Daily Frequency: 2
   - Duration (days): 5
   - Instructions: "Take after meals"
3. Click "Add Medication"
4. ✅ Medication appears in list
5. ✅ Can remove medication with X button

#### Add Lab Tests:
1. Select lab test (e.g., "Complete Blood Count")
2. Click "Add Test"
3. ✅ Test appears in list
4. ✅ Can remove with X button

#### Submit Checkup:
1. Click "Save Checkup"
2. ✅ Success alert: "Checkup saved successfully!"
3. ✅ Form resets automatically
4. ✅ Returns to appointment list

---

## API Endpoints Being Used

### Dashboard
- `GET /doctors/profile`
- `GET /doctors/dashboard/stats`
- `GET /doctors/dashboard/upcoming-appointments?limit=5`
- `GET /doctors/dashboard/recent-checkups?limit=5`

### Schedules
- `GET /doctorschedules`
- `POST /doctorschedules`
- `DELETE /doctorschedules/:id`

### Appointments
- `GET /doctors/appointments/booked`
- `GET /drugs` (for prescription)
- `GET /labtests` (for recommendations)
- `POST /checkups`

---

## Known Limitations

### 1. Cancel Appointment - ❌ NOT IMPLEMENTED
**Current**: Button exists but not functional
**Workaround**: Feature disabled in UI update
**Needed**: Backend API endpoint

### 2. Toggle Slot Bookable - ❌ NOT IMPLEMENTED
**Current**: Slots display only
**Previous**: Had block/unblock functionality
**Needed**: Backend API endpoint

### 3. Create Checkup Without Appointment
**Error**: "Appointment not found" (404)
**Reason**: Appointments must be booked first (by receptionist/patient)
**Workaround**: Create appointment via receptionist portal first

---

## Debugging Tips

### Check Browser Console
```javascript
// API calls logged automatically
// Look for:
console.log("Error fetching...", error)
```

### Check Network Tab
- All requests go to `http://localhost:3002`
- Look for 401 (auth issues), 404 (not found), 400 (validation errors)

### Common Issues

1. **"Loading..." forever**
   - Check backend is running
   - Check API_BASE_URL in `.env.local`
   - Check browser console for errors

2. **401 Unauthorized**
   - Token expired
   - Log out and log back in
   - Check JWT_SECRET matches between frontend/backend

3. **404 Not Found**
   - Endpoint doesn't exist
   - Check backend routes are registered
   - Verify API path is correct

4. **Empty Data**
   - Database not seeded
   - Run `npm run seed` in hospital-backend
   - Create test data manually

---

## Success Criteria

After testing, you should see:

✅ Dashboard loads with real doctor name and stats
✅ Can create schedules with auto-generated slots
✅ Can delete schedules with confirmation
✅ Can view all booked appointments (if any exist)
✅ Can perform checkup with medications and lab tests
✅ All loading states work correctly
✅ All error messages display properly
✅ No console errors (except expected API limitations)

---

## Next Steps

1. **Test with Real Data**: Create appointments via receptionist portal
2. **Build Missing APIs**: Cancel appointment, toggle slot bookable
3. **Add Search/Filter**: For large datasets
4. **Mobile Testing**: Test responsive design
5. **Performance**: Check with 100+ appointments/checkups
