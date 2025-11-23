# Patient Portal - Quick Start Guide

## Prerequisites
- Node.js installed
- Hospital frontend project set up
- Dependencies installed (`npm install`)

## Running the Patient Portal

### 1. Start the Development Server

```powershell
cd hospital-frontend
npm run dev
```

The application will start at `http://localhost:3000`

### 2. Access the Patient Portal

Navigate to: `http://localhost:3000/patient/dashboard`

**Note:** The patient portal has a role guard that requires PATIENT role authentication. For development with mock data, you may need to temporarily disable the role guard or use a test patient account.

### 3. Testing Features

#### Dashboard
1. Go to `/patient/dashboard`
2. View patient profile information
3. Check upcoming appointments summary
4. Review recent medical history

#### Book an Appointment
1. Click "Appointments" in the sidebar
2. Click "Book Appointment" button
3. Select a department (e.g., Cardiology)
4. Choose a doctor from the filtered list
5. Pick an available time slot
6. Optionally add reason for visit
7. Click "Confirm Booking"

#### View All Appointments
1. Navigate to "Appointments" page
2. Use tabs to filter:
   - **All**: See all appointments
   - **Upcoming**: Only confirmed future appointments
   - **Completed**: Past and completed appointments
3. Click "Cancel" on an upcoming appointment to test cancellation

#### View Medical History
1. Click "Medical History" in the sidebar
2. Click on any checkup card to expand details
3. View:
   - Diagnosis and symptoms
   - Vital signs (BP, temperature, heart rate, blood sugar)
   - Prescribed medications with dosage
   - Recommended lab tests
   - Doctor's notes

## Mock Data Overview

All data is loaded from `lib/mock-data-patient.ts`:

### Mock Patient Profile
- **Name:** Sarah Ahmed
- **Email:** sarah.ahmed@example.com
- **Blood Group:** A+
- **Phone:** +923001234567

### Mock Doctors Available
- Dr. Ahmed Khan (Cardiology)
- Dr. Fatima Ali (Neurology)
- Dr. Hassan Malik (General Medicine)
- And more across 6 departments

### Mock Appointments
- 2 confirmed upcoming appointments
- Multiple available time slots for booking
- Past appointments for history

### Mock Medical Records
- 4 detailed checkups
- Complete with medications, lab tests, and vital signs
- Realistic diagnoses and doctor notes

## Development Tips

### Modifying Mock Data

Edit `lib/mock-data-patient.ts` to:
- Add more patients
- Create more appointments
- Add additional doctors
- Customize medical history

### Adding New Features

1. Create component in `components/patient/[feature]/`
2. Add route to navigation in `patient-navigation.tsx`
3. Update main page router in `app/patient/dashboard/page.tsx`

### Testing Different Scenarios

#### Test Booking Flow
```typescript
// In book-appointment-dialog.tsx, modify mockAvailableSlots
// Add or remove slots to test different availability scenarios
```

#### Test Appointment States
```typescript
// In mock-data-patient.ts, change appointment status
status: "confirmed" | "completed" | "cancelled"
```

#### Test Medical History
```typescript
// Add new checkups to mockPatientCheckups array
// Include different medications and lab tests
```

## Common Tasks

### Change Patient Information
Edit `mockPatientProfile` in `mock-data-patient.ts`

### Add New Department
Add to `mockDepartments` array and ensure doctors have matching `departmentName`

### Customize Time Slots
Modify `mockAvailableSlots` - adjust dates, times, and availability

### Add More Checkups
Append to `mockPatientCheckups` array with complete medical details

## Component Structure

```
Patient Portal Architecture:

┌─────────────────────────────────────┐
│     patient-navigation.tsx          │
│     (Sidebar Navigation)            │
└─────────────────────────────────────┘
                 │
                 ├──> dashboard-page.tsx
                 │    ├─ Profile Card
                 │    ├─ Stats Cards
                 │    ├─ Upcoming Appointments
                 │    └─ Recent Medical History
                 │
                 ├──> appointments-page.tsx
                 │    ├─ book-appointment-dialog.tsx
                 │    │  ├─ Select Department
                 │    │  ├─ Select Doctor
                 │    │  ├─ Select Slot
                 │    │  └─ Enter Reason
                 │    │
                 │    └─ appointments-list.tsx
                 │       ├─ Tab Filters
                 │       ├─ Appointment Cards
                 │       └─ Cancel Dialog
                 │
                 └──> history-page.tsx
                      └─ Collapsible Checkup Cards
                         ├─ Diagnosis
                         ├─ Vital Signs
                         ├─ Medications
                         ├─ Lab Tests
                         └─ Notes
```

## Styling Notes

### Theme
- Uses Tailwind CSS with shadcn/ui components
- Supports light/dark mode
- Responsive design (mobile, tablet, desktop)

### Colors
- **Primary:** Blue (buttons, links, active states)
- **Success:** Green (completed appointments, lab tests)
- **Warning:** Yellow (pending states)
- **Danger:** Red (cancelled appointments, critical info)
- **Muted:** Gray (secondary text, borders)

### Icons
All from `lucide-react`:
- Navigation: `Home`, `Calendar`, `FileText`
- Actions: `Plus`, `LogOut`
- Content: `User`, `Activity`, `Pill`, `TestTube`
- UI: `ChevronDown`, `ChevronUp`, `Clock`

## Next Steps

### Phase 2: API Integration

When ready to connect to backend:

1. **Create API Service** (`lib/api/patient.ts`):
```typescript
import { axiosInstance } from './doctor';

export const patientAPI = {
  getProfile: () => axiosInstance.get('/patient/profile'),
  getAppointments: () => axiosInstance.get('/patient/appointments'),
  bookAppointment: (data) => axiosInstance.post('/appointment/book', data),
  cancelAppointment: (id) => axiosInstance.delete(`/appointment/${id}`),
  getCheckups: () => axiosInstance.get('/patient/checkups'),
  // ... more endpoints
};
```

2. **Update Components**:
Replace mock data imports with API calls:
```typescript
// Before
import { mockPatientProfile } from '@/lib/mock-data-patient';

// After
import { patientAPI } from '@/lib/api/patient';
const { data: profile } = await patientAPI.getProfile();
```

3. **Add Loading States**:
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  patientAPI.getProfile()
    .then(res => setData(res.data))
    .finally(() => setLoading(false));
}, []);
```

4. **Add Error Handling**:
```typescript
try {
  await patientAPI.bookAppointment(appointmentData);
  toast.success('Appointment booked successfully!');
} catch (error) {
  toast.error('Failed to book appointment. Please try again.');
}
```

## Troubleshooting

### Role Guard Issues
If you can't access `/patient/dashboard`:
- Temporarily comment out `<RoleGuard>` in `app/patient/layout.tsx`
- Or ensure you're logged in as a patient

### Import Errors
If you see "Cannot find module" errors:
- Restart the dev server
- Clear `.next` cache: `rm -rf .next` (or `Remove-Item -Recurse -Force .next` on PowerShell)
- Reinstall dependencies: `npm install`

### Styling Issues
- Check Tailwind config includes patient components
- Verify shadcn/ui components are properly installed
- Clear browser cache

### Mock Data Not Showing
- Check import paths are correct (`@/lib/mock-data-patient`)
- Verify mock data file exists
- Check console for JavaScript errors

## Support

For issues or questions:
1. Check the main implementation guide: `PATIENT_PORTAL_IMPLEMENTATION.md`
2. Review component source code for inline comments
3. Compare with doctor portal implementation (same patterns)
4. Check browser console for errors

## Summary

The patient portal is now fully functional with:
- ✅ Complete dashboard view
- ✅ Appointment booking system
- ✅ Appointment management (view, cancel)
- ✅ Complete medical history display
- ✅ Responsive navigation
- ✅ Mock data for testing

Ready for API integration in the next phase!
