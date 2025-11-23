# Patient Portal - User Flow Diagrams

## 1. Application Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                 http://localhost:3000/patient/dashboard          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    app/patient/layout.tsx                        │
│                    ┌──────────────────┐                         │
│                    │   Header         │                         │
│                    ├──────────────────┤                         │
│                    │   Role Guard     │ ◄── Checks PATIENT role │
│                    │   (PATIENT)      │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              app/patient/dashboard/page.tsx                      │
│  ┌────────────────┐  ┌─────────────────────────────────────┐  │
│  │                │  │                                       │  │
│  │   Sidebar      │  │    Main Content Area                 │  │
│  │   Navigation   │  │    (State-based routing)             │  │
│  │                │  │                                       │  │
│  │  • Dashboard   │  │  ┌──────────────────────────────┐   │  │
│  │  • Appointments│  │  │  Conditional Rendering:      │   │  │
│  │  • History     │  │  │                              │   │  │
│  │                │  │  │  if (page === "dashboard")   │   │  │
│  │  [Logout]      │  │  │    → DashboardPage           │   │  │
│  │                │  │  │  if (page === "appointments")│   │  │
│  └────────────────┘  │  │    → AppointmentsPage        │   │  │
│                      │  │  if (page === "history")     │   │  │
│                      │  │    → HistoryPage             │   │  │
│                      │  └──────────────────────────────┘   │  │
│                      └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Dashboard Page Flow

```
┌───────────────────────────────────────────────────────────────────┐
│                    Dashboard Page Load                             │
└───────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   Load Mock Data from
                   mock-data-patient.ts
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
  mockPatientProfile   mockMyAppointments   mockPatientCheckups
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌────────────────┐    ┌─────────────────┐
│ Welcome Card  │    │ Stats Cards    │    │ Profile Card    │
│ "Welcome      │    │ • Upcoming: 2  │    │ • Name          │
│  Sarah!"      │    │ • Total: 4     │    │ • Email         │
└───────────────┘    │ • Last Visit   │    │ • Phone         │
                     └────────────────┘    │ • Blood Group   │
                                           │ • Address       │
┌───────────────────────────────────────┐ └─────────────────┘
│    Upcoming Appointments Card          │
│    ┌─────────────────────────────────┐│
│    │ Dr. Ahmed Khan - Cardiology     ││
│    │ 📅 Today, 2:00 PM - 3:00 PM     ││
│    │ 💬 Heart condition checkup      ││
│    └─────────────────────────────────┘│
│    ┌─────────────────────────────────┐│
│    │ Dr. Fatima Ali - Neurology      ││
│    │ 📅 Tomorrow, 10:00 AM - 11:00 AM││
│    │ 💬 Headaches follow-up          ││
│    └─────────────────────────────────┘│
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│    Recent Medical History Card         │
│    ┌─────────────────────────────────┐│
│    │ Checkup #1 - 1 week ago         ││
│    │ Dr. Ahmed Khan                  ││
│    │ 💊 1 medication 🧪 2 lab tests  ││
│    └─────────────────────────────────┘│
│    ┌─────────────────────────────────┐│
│    │ Checkup #2 - 2 weeks ago        ││
│    │ Dr. Hassan Malik                ││
│    │ 💊 2 medications 🧪 0 lab tests ││
│    └─────────────────────────────────┘│
└───────────────────────────────────────┘
```

## 3. Appointment Booking Flow

```
                  User Clicks "Book Appointment"
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │      Dialog Opens - Step 1                  │
        │                                             │
        │      SELECT DEPARTMENT                      │
        │      ┌────────────────────────┐            │
        │      │ Dropdown Menu          │            │
        │      │ • Cardiology           │            │
        │      │ • Neurology            │ ◄───────── User selects
        │      │ • Orthopedics          │
        │      │ • Pediatrics           │
        │      │ • Gynecology           │
        │      │ • General Medicine     │
        │      └────────────────────────┘
        └─────────────────────────────────────────────┘
                              │
                              ▼
                    Department Selected
                              │
                              ▼
              Filter doctors by department
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │      Step 2 Appears                         │
        │                                             │
        │      SELECT DOCTOR                          │
        │      ┌────────────────────────┐            │
        │      │ Dropdown Menu          │            │
        │      │ Dr. X - Specialization │ ◄───────── User selects
        │      │ Dr. Y - Specialization │
        │      │ Dr. Z - Specialization │
        │      └────────────────────────┘
        └─────────────────────────────────────────────┘
                              │
                              ▼
                      Doctor Selected
                              │
                              ▼
            Filter slots by doctor + future time
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │      Step 3 Appears                         │
        │                                             │
        │      SELECT TIME SLOT                       │
        │      ┌────────────────────────┐            │
        │      │ Slot Grid              │            │
        │      │ ┌────────┐ ┌────────┐ │            │
        │      │ │ Today  │ │Tomorrow│ │            │
        │      │ │2-3 PM  │ │10-11 AM│ │ ◄───────── User clicks
        │      │ └────────┘ └────────┘ │
        │      │ ┌────────┐ ┌────────┐ │
        │      │ │Day +2  │ │ Day +2 │ │
        │      │ │2-3 PM  │ │3-4 PM  │ │
        │      │ └────────┘ └────────┘ │
        │      └────────────────────────┘
        └─────────────────────────────────────────────┘
                              │
                              ▼
                      Slot Selected
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │      Step 4 Appears (Optional)              │
        │                                             │
        │      REASON FOR VISIT                       │
        │      ┌────────────────────────┐            │
        │      │ Text Area              │            │
        │      │ "I have been having..."│ ◄───────── User types
        │      │                        │
        │      └────────────────────────┘
        │                                             │
        │      [Cancel]  [Confirm Booking] ◄───────── User confirms
        └─────────────────────────────────────────────┘
                              │
                              ▼
                  Add to appointments list
                              │
                              ▼
                    Show success message
                              │
                              ▼
                       Close dialog
                              │
                              ▼
              Appointment appears in "Upcoming" tab
```

## 4. Appointments Page Flow

```
                    Appointments Page Loads
                              │
                              ▼
                Load mockMyAppointments
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
   All Appointments    Upcoming Only         Completed Only
        │                     │                      │
        │              Filter: status ==      Filter: status ==
        │              "confirmed" &&         "completed" ||
        │              date > now             date < now
        │                     │                      │
        └─────────────────────┴──────────────────────┘
                              │
                              ▼
              Display Appointments List
                              │
        ┌─────────────────────┴──────────────────────┐
        │                                            │
        ▼                                            ▼
  For Each Appointment                    If Upcoming & Confirmed
        │                                            │
        ▼                                            ▼
┌─────────────────────┐                  Show Cancel Button
│ Appointment Card    │                            │
│ ┌─────────────────┐ │                            │
│ │ Doctor Info     │ │              User Clicks Cancel
│ │ Department      │ │                            │
│ │ Date & Time     │ │                            ▼
│ │ Status Badge    │ │              ┌──────────────────────┐
│ │ Reason          │ │              │ Confirmation Dialog   │
│ └─────────────────┘ │              │                      │
│                     │              │ "Are you sure you    │
│ [Cancel] (if future)│              │  want to cancel?"    │
└─────────────────────┘              │                      │
                                     │ [Keep] [Cancel Apt]  │
                                     └──────────────────────┘
                                                │
                                      ┌─────────┴──────────┐
                                      │                    │
                                      ▼                    ▼
                                  Keep It         Update status to
                                (Close)            "cancelled"
                                                        │
                                                        ▼
                                              Re-render list
                                              (status badge now red)
```

## 5. Medical History Page Flow

```
                    History Page Loads
                              │
                              ▼
                Load mockPatientCheckups
                              │
                              ▼
          Display Checkup Cards (All Collapsed)
                              │
        ┌─────────────────────┴──────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
  Checkup Card #1      Checkup Card #2        Checkup Card #3
  (Collapsed)          (Collapsed)            (Collapsed)
        │                     │                      │
        │              ┌──────┴──────┐               │
        │              │             │               │
        ▼              ▼             ▼               ▼
  User Clicks    Other Cards   User Clicks     Other Cards
    to Expand    Stay Collapsed  to Expand    Stay Collapsed
        │                             │
        ▼                             ▼
  Card Expands                  Card Expands
        │                             │
        ▼                             ▼
┌──────────────────────┐    ┌──────────────────────┐
│ Expanded View        │    │ Expanded View        │
│                      │    │                      │
│ 📋 Diagnosis         │    │ 📋 Diagnosis         │
│ "Hypertension..."    │    │ "Viral infection..." │
│                      │    │                      │
│ 🩺 Symptoms          │    │ 🩺 Symptoms          │
│ "Headaches..."       │    │ "Sore throat..."     │
│                      │    │                      │
│ 💓 Vital Signs       │    │ 💓 Vital Signs       │
│ ┌────┬────┬────┬───┐│    │ ┌────┬────┬────┬───┐│
│ │ BP │Temp│ HR │BS ││    │ │ BP │Temp│ HR │BS ││
│ │140 │98.6│78  │110││    │ │120 │99.2│82  │95 ││
│ └────┴────┴────┴───┘│    │ └────┴────┴────┴───┘│
│                      │    │                      │
│ 💊 Medications (1)   │    │ 💊 Medications (2)   │
│ • Amlodipine 5mg     │    │ • Paracetamol 500mg  │
│   1x daily, 30 days  │    │   3x daily, 5 days   │
│                      │    │ • Antihistamine      │
│ 🧪 Lab Tests (2)     │    │   2x daily, 7 days   │
│ • Lipid Profile      │    │                      │
│ • ECG                │    │ 🧪 Lab Tests (0)     │
│                      │    │                      │
│ 📝 Doctor's Notes    │    │ 📝 Doctor's Notes    │
│ "Patient advised..." │    │ "Complete rest..."   │
└──────────────────────┘    └──────────────────────┘
        │                             │
        ▼                             ▼
  Click Again to Collapse       Click Again to Collapse
```

## 6. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                                                                  │
│  lib/mock-data-patient.ts                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  mockPatientProfile      mockDoctors                      │  │
│  │  • Patient info          • 6+ doctors                     │  │
│  │                          • All specializations            │  │
│  │  mockDepartments                                          │  │
│  │  • 6 departments         mockAvailableSlots               │  │
│  │                          • Today, tomorrow, day+2         │  │
│  │  mockMyAppointments      • Various times                  │  │
│  │  • 2 confirmed           • Bookable status                │  │
│  │                                                            │  │
│  │  mockPatientCheckups                                      │  │
│  │  • 4 complete records                                     │  │
│  │  • With medications & lab tests                           │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
          ────────────────────┼────────────────────
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│  DASHBOARD       │ │  APPOINTMENTS    │ │  HISTORY        │
│                  │ │                  │ │                 │
│  Uses:           │ │  Uses:           │ │  Uses:          │
│  • Profile       │ │  • Appointments  │ │  • Checkups     │
│  • Appointments  │ │  • Doctors       │ │  • Details      │
│  • Checkups      │ │  • Departments   │ │                 │
│                  │ │  • Slots         │ │                 │
└──────────────────┘ └──────────────────┘ └─────────────────┘
```

## 7. Future API Integration Flow

```
           CURRENT (Mock Data)                    FUTURE (Real APIs)
                                    
┌───────────────────────────┐        ┌────────────────────────────┐
│  Component                │        │  Component                 │
│  ↓                        │        │  ↓                         │
│  Import mock data         │        │  Import API service        │
│  ↓                        │   →    │  ↓                         │
│  Use directly in render   │        │  useState for data         │
│                           │        │  useEffect for fetch       │
└───────────────────────────┘        │  ↓                         │
                                     │  Loading state             │
                 Example:            │  Error handling            │
                                     │  ↓                         │
import {                             │  Render with fetched data  │
  mockPatientProfile                 └────────────────────────────┘
} from '@/lib/mock-data-patient'                   
                                              Example:
const profile = mockPatientProfile            
                                     import { patientAPI } 
                                       from '@/lib/api/patient'
                                     
                                     const [profile, setProfile] = 
                                       useState(null)
                                     const [loading, setLoading] = 
                                       useState(true)
                                     
                                     useEffect(() => {
                                       patientAPI.getProfile()
                                         .then(res => 
                                           setProfile(res.data))
                                         .finally(() => 
                                           setLoading(false))
                                     }, [])
```

## 8. Component Interaction Map

```
                    app/patient/dashboard/page.tsx
                    (Main Router & State Manager)
                                │
                  ┌─────────────┼─────────────┐
                  │             │             │
                  ▼             ▼             ▼
        ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
        │ Dashboard   │ │Appointments │ │ History      │
        │ Page        │ │ Page        │ │ Page         │
        └─────────────┘ └─────────────┘ └──────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌───────────────────┐
        │ Appointments     │  │ Book Appointment  │
        │ List             │  │ Dialog            │
        │                  │  │                   │
        │ • Filter tabs    │  │ • Multi-step form │
        │ • Cancel dialog  │  │ • Validation      │
        └──────────────────┘  └───────────────────┘

All components import from:
        │
        ▼
┌─────────────────────┐
│ lib/mock-data-      │
│    patient.ts       │
│                     │
│ Provides all data   │
│ for the entire      │
│ patient portal      │
└─────────────────────┘
```

---

## Summary

These flow diagrams illustrate:
1. **Application Structure**: How the patient portal fits into the app
2. **Dashboard Flow**: Data loading and display logic
3. **Booking Flow**: Step-by-step appointment creation process
4. **Appointments Management**: Viewing and canceling appointments
5. **Medical History**: Accessing detailed checkup records
6. **Data Architecture**: How mock data flows through components
7. **API Migration Path**: How to transition from mock to real data
8. **Component Relationships**: How all pieces work together

Use these diagrams to understand:
- User journeys through the portal
- Data dependencies
- Component responsibilities
- Future development path
