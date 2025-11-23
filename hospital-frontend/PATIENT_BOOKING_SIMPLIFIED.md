# Patient Booking - Simplified Backend Schema Version

## Overview
Updated patient appointment booking to:
1. **Integrated Navigation**: Part of patient portal navigation (not separate URL)
2. **Backend Schema Only**: Doctor profiles show only fields from Prisma schema

## Changes Made

### 1. Navigation Integration
**Before**: Separate route at `/patient/book-appointment`
**After**: Part of patient portal navigation menu as "Book Appointment"

**Updated Files:**
- `app/patient/dashboard/page.tsx` - Added "book" page type
- `components/patient/patient-navigation.tsx` - Added "Book Appointment" menu item
- `components/patient/appointments/appointments-page.tsx` - Removed separate link button

### 2. Simplified Mock Data
**New File**: `lib/mock-data-patient-simple.ts`

Based on Prisma schema models, includes only:

#### From `User` + `Doctor` models:
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
  licenseNumber: string;      // Unique doctor license
  specialization: string;      // e.g., "Interventional Cardiology"
  qualification: string;       // e.g., "MBBS, FCPS (Cardiology)"
  experience: number;          // Years of experience
}
```

**Removed Fields** (not in schema):
- ❌ Rating & reviews
- ❌ Consultation fee
- ❌ Languages spoken
- ❌ Education history array
- ❌ Achievements array
- ❌ Detailed about section

#### From `DoctorSchedule` + `AppointmentSlot` models:
```typescript
{
  id: number;
  scheduleId: number;
  startTime: string;
  endTime: string;
  isBookable: boolean;
  isBooked: boolean;
}
```

#### From `Appointment` + `OnlineAppointment` models:
```typescript
{
  id: number;
  patientId: number;
  slotId: number;
  reason?: string;
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "NOT_ATTENDED";
}
```

### 3. Simplified Doctor Profile Display
**New Component**: `components/patient/booking/book-appointment-page.tsx`

**Shows Only:**
- Name (Dr. FirstName LastName)
- Specialization
- Department
- Experience (X years)
- Qualification
- License Number

**Profile Layout:**
```
┌─────────────────────────────────────────┐
│  [Avatar]  Dr. Ahmed Hassan              │
│            Interventional Cardiology     │
│            15 years experience           │
│            Cardiology Department         │
│                                          │
│  Qualification: MBBS, FCPS (Cardiology) │
│  License Number: PMC-12345              │
└─────────────────────────────────────────┘
```

### 4. Navigation Menu Structure
```
Patient Portal Sidebar:
├── Dashboard
├── Book Appointment    ← NEW (integrated)
├── My Appointments
└── Medical History
```

## Mock Data Structure

### 12 Doctors Across 9 Departments
1. **Cardiology** (2 doctors)
   - Dr. Ahmed Hassan - 15 years - Interventional Cardiology
   - Dr. Sarah Khan - 12 years - Pediatric Cardiology

2. **Neurology** (2 doctors)
   - Dr. Muhammad Ali - 10 years - Stroke Medicine
   - Dr. Fatima Malik - 8 years - Epilepsy

3. **General Medicine** (2 doctors)
   - Dr. Usman Tariq - 14 years - Internal Medicine
   - Dr. Ayesha Siddiqui - 7 years - General Practitioner

4. **Pediatrics**: Dr. Hassan Sheikh - 11 years
5. **Gynecology**: Dr. Zainab Hussain - 13 years
6. **Orthopedics**: Dr. Bilal Ahmed - 16 years
7. **Dermatology**: Dr. Mariam Yousaf - 9 years
8. **Psychiatry**: Dr. Ali Raza - 10 years
9. **ENT**: Dr. Sana Khalid - 8 years

### Appointment Slots
- **Per Doctor**: 9 slots across 3 days
- **Time Slots**: 
  - Morning: 9:00 AM, 10:00 AM, 11:00 AM
  - Afternoon: 2:00 PM, 3:00 PM, 4:00 PM
- **Duration**: 30 minutes each
- **Status**: ~70% available, ~30% booked

## User Flow (Updated)

### 1. Navigation
```
Patient Dashboard → Click "Book Appointment" in sidebar → Booking page loads in same portal
```

### 2. Doctor Selection
```
Search/Browse → Select Doctor → View Simplified Profile
```

### 3. Profile View
Shows only backend schema fields:
- Name & specialization
- Department
- Experience & qualification
- License number

### 4. Slot Booking
```
Browse Available Slots → Select Time → Add Reason (optional) → Confirm Booking
```

## API Integration Points

### GET Available Doctors
```typescript
GET /api/doctors
Response: Doctor[] (matches schema fields)
```

### GET Doctor Schedules
```typescript
GET /api/doctor-schedules/{doctorId}
GET /api/appointment-slots/available?doctorId={id}
Response: AppointmentSlot[]
```

### POST Book Appointment
```typescript
POST /api/appointments
Body: {
  patientId: number,
  slotId: number,
  reason?: string
}
Response: Appointment with OnlineAppointment
```

## Files Summary

### New Files
1. `lib/mock-data-patient-simple.ts` - Backend schema-based mock data
2. `components/patient/booking/book-appointment-page.tsx` - Simplified booking component

### Updated Files
1. `app/patient/dashboard/page.tsx` - Added "book" page type
2. `components/patient/patient-navigation.tsx` - Added booking to navigation
3. `components/patient/appointments/appointments-page.tsx` - Removed link button

### Deprecated Files
- `app/patient/book-appointment/page.tsx` - No longer needed (separate route)
- `lib/mock-data-patient-booking.ts` - Replaced with simplified version
- `PATIENT_BOOKING_FULL_SCREEN.md` - Documentation for old approach

## Benefits

### ✅ Schema Alignment
- All fields match Prisma schema exactly
- Easy to integrate with real backend API
- No extra fields to mock or maintain

### ✅ Better UX
- Integrated navigation (no separate URL)
- Consistent with patient portal flow
- Faster navigation between pages

### ✅ Cleaner Code
- Simpler mock data structure
- Less complexity in components
- Focus on real backend capabilities

## Comparison: Before vs After

### Doctor Profile Fields

| Field | Before | After | Source |
|-------|--------|-------|--------|
| Name | ✅ | ✅ | User model |
| Specialization | ✅ | ✅ | Doctor model |
| Department | ✅ | ✅ | Department model |
| Experience | ✅ | ✅ | Doctor model |
| Qualification | ✅ | ✅ | Doctor model |
| License | ❌ | ✅ | Doctor model |
| Rating | ✅ | ❌ | Not in schema |
| Reviews | ✅ | ❌ | Not in schema |
| Fee | ✅ | ❌ | Not in schema |
| Languages | ✅ | ❌ | Not in schema |
| Education Array | ✅ | ❌ | Not in schema |
| Achievements | ✅ | ❌ | Not in schema |
| About Text | ✅ | ❌ | Not in schema |

### Navigation Structure

| Aspect | Before | After |
|--------|--------|-------|
| Route | `/patient/book-appointment` | Integrated in portal |
| Access | Via link/button | Via sidebar navigation |
| Back Button | Needed | Not needed |
| Breadcrumbs | Needed | Not needed |
| URL Change | Yes | No (SPA) |

## Testing

### Verify These Scenarios
1. ✅ Click "Book Appointment" in sidebar loads booking page
2. ✅ Search filters doctors correctly
3. ✅ Doctor profile shows only schema fields
4. ✅ Slot selection works
5. ✅ Booking confirmation works
6. ✅ Navigation between pages is smooth
7. ✅ No TypeScript errors
8. ✅ Mock data matches backend schema

## Next Steps

### For Backend Integration
1. Replace `mockDoctorsSimple` with API call to `/api/doctors`
2. Replace `mockDoctorSchedules` with API call to `/api/appointment-slots/available`
3. Replace `handleBooking` console.log with POST to `/api/appointments`
4. Add loading states during API calls
5. Add error handling for failed requests
6. Add success toast notifications

### Potential Schema Extensions
If you want to add more fields in the future, update the schema first:
```prisma
model Doctor {
  // ...existing fields...
  rating          Float?    @default(0)
  totalReviews    Int       @default(0)
  consultationFee Decimal?
  languages       String[]  @default([])
  about           String?   @db.Text
}
```

## Summary

The patient booking experience is now:
- ✅ **Integrated** into patient portal navigation
- ✅ **Simplified** to show only backend schema fields
- ✅ **Aligned** with your Prisma database models
- ✅ **Ready** for backend API integration
- ✅ **Cleaner** and more maintainable

All mock data matches your actual database structure, making the transition to real API calls straightforward.
