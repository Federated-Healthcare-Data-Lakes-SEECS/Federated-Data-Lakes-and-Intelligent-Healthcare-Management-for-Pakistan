# Patient Booking - Full Screen Experience

## Overview
Complete redesign of the patient appointment booking experience from a modal-based UI to a full-screen, doctor-centric booking page with rich profiles and smooth UX.

## Key Features

### 🎨 Full-Screen Design
- **Complete Page**: Dedicated route at `/patient/book-appointment`
- **No Modal Limitations**: Full space for comprehensive information
- **Smooth Navigation**: Integrated with patient portal navigation

### 🔍 Smart Search
- **Real-time Search**: Instant filtering as you type
- **Multi-field Search**: Search by doctor name, specialization, or department
- **Result Count**: Shows number of matching doctors and available slots

### 👨‍⚕️ Doctor-Centric View
- **Profile Cards**: Beautiful cards with doctor photos (initials), ratings, and experience
- **Comprehensive Profiles**: When selected, shows full doctor information:
  - Personal details (name, specialization, department)
  - Ratings and reviews (e.g., 4.8/5 with 245 reviews)
  - Consultation fee
  - Languages spoken
  - Education history (universities and degrees)
  - Professional achievements
  - Detailed about section

### 📅 Visual Schedule Selection
- **Slot Grid**: Visual time slot selection grouped by date
- **Availability Status**: Clear indication of booked vs available slots
- **Multi-day View**: Shows slots for today, tomorrow, and beyond
- **Time Display**: Start and end time for each slot
- **Selected State**: Visual feedback for selected slot

### ✨ User Experience
- **Three-column Layout**:
  1. Left: Search bar + doctor list (scrollable)
  2. Right: Doctor profile + available slots (2 columns)
- **Sticky Header**: Always visible with "Confirm Booking" button
- **Real-time Stats**: Shows total doctors, available slots, and departments
- **Reason Field**: Optional text area for visit description
- **Back Navigation**: Easy return to previous page

## File Structure

### New Files Created
```
app/patient/book-appointment/
└── page.tsx                    # Main full-screen booking page

lib/
└── mock-data-patient-booking.ts  # Comprehensive mock data
    ├── mockPatientProfile       # Patient information
    ├── mockDoctorsDetailed      # 12 doctors with full profiles
    ├── mockDoctorSchedules      # ~80 appointment slots
    ├── mockMyAppointments       # Booked appointments
    ├── mockPatientCheckups      # Medical history
    └── mockDepartments          # Department list
```

### Updated Files
```
components/patient/
├── patient-navigation.tsx       # Added "Book Appointment" button
└── appointments/
    └── appointments-page.tsx    # Replaced dialog with link to booking page
```

## Mock Data Structure

### Doctors (12 Total)
- **Cardiology**: 2 doctors (Dr. Ahmed Hassan, Dr. Sarah Khan)
- **Neurology**: 2 doctors (Dr. Muhammad Ali, Dr. Fatima Malik)
- **General Medicine**: 2 doctors (Dr. Usman Tariq, Dr. Ayesha Siddiqui)
- **Pediatrics**: Dr. Hassan Sheikh
- **Gynecology**: Dr. Zainab Hussain
- **Orthopedics**: Dr. Bilal Ahmed
- **Dermatology**: Dr. Mariam Yousaf
- **Psychiatry**: Dr. Ali Raza
- **ENT**: Dr. Sana Khalid

### Doctor Profile Data
Each doctor includes:
- Basic info (name, email, specialization, department)
- Experience (5-15 years)
- Rating (4.6-4.9 out of 5)
- Total reviews (145-428)
- Consultation fee (Rs. 1700-2500)
- Languages (2-3 languages including English, Urdu)
- Education (2-3 degrees from Pakistani universities)
- Achievements (3 professional achievements each)
- Detailed about section (150-200 words)

### Appointment Slots
- **Total Slots**: ~80 across all doctors
- **Per Doctor**: 5-10 slots
- **Time Range**: Today, tomorrow, and day after tomorrow
- **Slot Duration**: 30 minutes each
- **Status**: Most available, some booked for realism
- **Time Slots**: Morning (9 AM - 12 PM), Afternoon (2 PM - 5 PM)

## User Flow

### 1. Navigation
```
Patient Dashboard → Click "Book Appointment" button → Full-screen booking page
```

### 2. Doctor Discovery
```
Search for doctor → Filter results → View doctor list with stats
```

### 3. Doctor Selection
```
Click doctor card → View full profile → See education, achievements, about
```

### 4. Slot Selection
```
Browse available slots → Grouped by date → Select time slot → Visual feedback
```

### 5. Booking Confirmation
```
Add reason (optional) → Click "Confirm Booking" → Success message → Return to dashboard
```

## Technical Details

### State Management
```typescript
const [searchQuery, setSearchQuery] = useState("");           // Search input
const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);  // Selected doctor ID
const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null); // Selected time slot
const [reason, setReason] = useState("");                     // Visit reason
```

### Filtering Logic
```typescript
// Real-time search filtering
const filteredDoctors = useMemo(() => {
  if (!searchQuery.trim()) return mockDoctorsDetailed;
  
  const query = searchQuery.toLowerCase();
  return mockDoctorsDetailed.filter((doctor) =>
    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(query) ||
    doctor.specialization.toLowerCase().includes(query) ||
    doctor.departmentName.toLowerCase().includes(query)
  );
}, [searchQuery]);

// Available slots filtering
const availableSlots = selectedDoctor
  ? mockDoctorSchedules.find((s) => s.doctorId === selectedDoctor)?.slots.filter(
      (slot) =>
        !slot.isBooked &&
        slot.isBookable &&
        new Date(slot.startTime) > new Date()
    ) || []
  : [];
```

### Slot Grouping
```typescript
// Group slots by date for better organization
const groupedSlots = useMemo(() => {
  const grouped: Record<string, typeof availableSlots> = {};
  availableSlots.forEach((slot) => {
    const date = new Date(slot.startTime).toDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(slot);
  });
  return grouped;
}, [availableSlots]);
```

## Design Features

### Gradient Background
```css
bg-gradient-to-br from-blue-50 via-white to-purple-50
dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
```

### Doctor Avatar
- **Initials Display**: First letter of first name + last name
- **Gradient Background**: `from-primary to-purple-600`
- **Sizes**: 
  - List view: 48px × 48px
  - Profile view: 96px × 96px

### Slot Cards
- **Unselected**: Border, hover effect, scale on hover
- **Selected**: Primary color, shadow, scale up
- **Layout**: Grid responsive (2-4 columns based on screen size)

### Stats Cards
- **Doctors**: Total filtered doctors (primary color)
- **Slots**: Total available slots (green)
- **Departments**: Unique departments (orange)

## Responsive Design

### Desktop (lg+)
- Three-column layout: 1/3 left (doctor list), 2/3 right (profile + slots)
- Full search bar with stats cards
- Large doctor profiles

### Tablet (md)
- Two-column layout adjusts
- Slot grid: 3 columns

### Mobile (sm)
- Single column stack
- Slot grid: 2 columns
- Compact doctor cards

## API Integration Points

When connecting to backend:

### 1. Fetch Doctors
```typescript
GET /api/doctors?specialization=&department=
Response: Doctor[] with profiles
```

### 2. Fetch Available Slots
```typescript
GET /api/appointment-slots/available?doctorId={id}
Response: Slot[] with dates and times
```

### 3. Book Appointment
```typescript
POST /api/appointments/book
Body: {
  slotId: number,
  patientId: number,
  reason?: string
}
Response: Appointment with booking confirmation
```

## Future Enhancements

### Planned Features
1. **Filter by Specialty**: Tabs or dropdown for department filtering
2. **Sort Options**: By rating, fee, experience, next available
3. **Date Picker**: Jump to specific date for slots
4. **Doctor Availability Calendar**: Monthly view of doctor schedules
5. **Reviews Section**: Show patient reviews with ratings
6. **Favorite Doctors**: Save preferred doctors for quick access
7. **Video Consultation**: Option for online appointments
8. **Insurance Check**: Verify insurance coverage

### UX Improvements
1. **Loading States**: Skeleton screens while fetching data
2. **Error Handling**: Graceful error messages
3. **Success Animation**: Confetti or checkmark on booking success
4. **Toast Notifications**: Real-time feedback for actions
5. **Progressive Disclosure**: Show more details on demand
6. **Mobile Optimization**: Bottom sheet for doctor profiles on mobile

## Performance Considerations

### Optimization Strategies
1. **Virtual Scrolling**: For large doctor lists (react-window)
2. **Memoization**: Used for filtered doctors and grouped slots
3. **Lazy Loading**: Load doctor details only when selected
4. **Image Optimization**: Use Next.js Image component for doctor photos
5. **Debounced Search**: Reduce filter recalculations (if API integrated)

## Accessibility

### Features Implemented
- **Keyboard Navigation**: Tab through doctors and slots
- **ARIA Labels**: Descriptive labels for screen readers
- **Focus Indicators**: Clear focus states on all interactive elements
- **Color Contrast**: WCAG AA compliant colors
- **Semantic HTML**: Proper heading hierarchy

## Testing Scenarios

### User Acceptance Tests
1. ✅ Search for doctor by name returns correct results
2. ✅ Select doctor displays full profile with all details
3. ✅ Available slots are grouped by date
4. ✅ Selected slot highlights visually
5. ✅ Confirm booking button only enabled when slot selected
6. ✅ Back button returns to previous page
7. ✅ Stats update based on filtered results
8. ✅ Reason field is optional

### Edge Cases
- No search results: Shows empty state message
- No available slots: Shows "check back later" message
- All doctors booked: Shows appropriate message
- Single doctor: Still works with selection flow

## Migration Notes

### From Old Modal to New Page
1. **Old**: `book-appointment-dialog.tsx` (modal with tabs)
2. **New**: `app/patient/book-appointment/page.tsx` (full screen)
3. **Navigation**: Updated to use Next.js Link
4. **Data**: Now uses `mock-data-patient-booking.ts`

### Breaking Changes
- Modal component no longer used for booking
- Old mock data (`mock-data-patient.ts`) still used for other features
- Need to update any direct references to booking dialog

## Summary

This redesign transforms the patient booking experience from a constrained modal dialog to a comprehensive full-screen application that prioritizes doctor discovery, profile visibility, and smooth appointment booking. The doctor-centric approach with rich profiles and visual slot selection creates a more intuitive and satisfying user experience.

**Key Metrics:**
- 12 doctors with complete profiles
- ~80 appointment slots across 3 days
- 9 medical specializations
- Real-time search and filtering
- Full-screen responsive design
- Smooth, professional UX

The implementation is fully functional with mock data and ready for backend API integration.
