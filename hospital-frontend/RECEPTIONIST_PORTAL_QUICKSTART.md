# Receptionist Portal - Quick Start Guide

## 🚀 Overview
Complete receptionist portal for hospital management system. Receptionists can register walk-in patients, book appointments, and manage their bookings.

---

## 📋 Features

### ✅ Dashboard
- View today's appointments
- Track total appointments booked
- Monitor upcoming appointments
- See patients registered today
- View profile information

### ✅ Register Patient
- Register new walk-in patients
- Complete patient information form
- Auto-formatted CNIC input
- Medical history collection
- Success confirmation

### ✅ Book Walk-in Appointment
- Search for patients (by name, email, CNIC)
- View available doctors with slots
- Select time slot
- Add reason for visit
- Instant booking confirmation

### ✅ My Appointments
- View all appointments you've booked
- Filter by status (BOOKED, COMPLETED, NOT_ATTENDED)
- Filter by time (upcoming, past, all)
- Search by patient or doctor name
- Complete appointment details

---

## 🏃 Quick Start

### Start Backend
```bash
cd hospital-backend
npm run start:dev
```

### Start Frontend
```bash
cd hospital-frontend
npm run dev
```

### Login
```
URL: http://localhost:3000/login

Email: receptionist@hospital.com
Password: password123
```

---

## 📁 Files Created

### API Service
```
lib/api-receptionist.ts           - API client (350+ lines)
```

### Pages
```
app/receptionist/
├── page.tsx                       - Root redirect
├── layout.tsx                     - Layout wrapper
└── dashboard/
    └── page.tsx                   - Main container
```

### Components
```
components/receptionist/
├── receptionist-navigation.tsx    - Sidebar nav (80 lines)
├── dashboard/
│   └── dashboard-page.tsx         - Dashboard (180 lines)
├── register-patient/
│   └── register-patient-page.tsx  - Registration (420 lines)
├── book-appointment/
│   └── book-appointment-page.tsx  - Booking (460 lines)
└── appointments/
    └── appointments-page.tsx      - Appointments list (260 lines)
```

### Updated
```
components/forms/login-form.tsx    - Added receptionist routing
```

---

## 🎯 User Workflows

### 1. Register New Patient
```
1. Click "Register Patient" in sidebar
2. Fill out form (name, email, password, CNIC, etc.)
3. Click "Register Patient"
4. View success confirmation
5. Click "Register Another Patient" (optional)
```

### 2. Book Appointment
```
1. Click "Book Appointment" in sidebar
2. Search for patient (name/email/CNIC)
3. Select patient from results
4. Choose doctor from available list
5. Select time slot
6. Add reason (optional)
7. Confirm booking
8. View confirmation
```

### 3. View Appointments
```
1. Click "My Appointments" in sidebar
2. Apply filters (status, time, search)
3. View detailed appointment cards
4. See patient, doctor, time, and reason
```

---

## 🔧 API Endpoints Used

```
# Profile & Dashboard
GET  /receptionists/profile/me
GET  /receptionists/dashboard/stats

# Patient Management
POST /receptionists/patients/register
GET  /receptionists/patients/search?q={searchTerm}
GET  /receptionists/patients/{id}

# Appointments
GET  /appointment-slots/doctors-with-slots
POST /receptionists/appointments/book-walkin
GET  /receptionists/appointments/my-appointments
```

---

## 🎨 UI Components

### Status Badges
- **BOOKED** → Blue
- **COMPLETED** → Green
- **NOT_ATTENDED** → Red
- **Walk-in** → Purple

### Icons
- Dashboard → Home
- Register → UserPlus
- Book → Calendar
- Appointments → ClipboardList

---

## ✅ Testing Checklist

### Dashboard
- [ ] Profile loads
- [ ] All 4 stats display
- [ ] Quick actions visible

### Register Patient
- [ ] Form renders
- [ ] CNIC auto-formats (12345-1234567-1)
- [ ] Validation works
- [ ] Success screen shows

### Book Appointment
- [ ] Search works (min 2 chars)
- [ ] Doctors list loads
- [ ] Slots grouped by date
- [ ] Can navigate back
- [ ] Success confirmation shows

### My Appointments
- [ ] Appointments load
- [ ] All filters work
- [ ] Search works
- [ ] Details display correctly

### Navigation
- [ ] All pages accessible
- [ ] Active page highlights
- [ ] Logout works

---

## 🐛 Troubleshooting

### Backend not responding
```bash
# Check if backend is running
curl http://localhost:3002/health

# Restart backend
cd hospital-backend
npm run start:dev
```

### Can't login
```bash
# Verify credentials
Email: receptionist@hospital.com
Password: password123

# Check database seeded
cd hospital-backend
npm run seed
```

### No doctors showing
```bash
# Check doctors table
# Ensure doctors have schedules
# Ensure slots are created and bookable
```

### CORS errors
```bash
# Check backend CORS settings in main.ts
# Ensure frontend URL is allowed
```

---

## 📊 Database Schema

### Key Tables
```sql
User              (id, email, password, firstName, lastName, cnic, gender)
Receptionist      (id, userId, phoneNumber, experience, qualification)
Patient           (id, userId, dateOfBirth, bloodGroup, phoneNumber, ...)
Appointment       (id, patientId, slotId, reason, createdAt)
WalkinAppointment (id, appointmentId, receptionistId, status)
AppointmentSlot   (id, scheduleId, startTime, endTime, isBooked, isBookable)
```

---

## 🔐 Security

### Authentication
- JWT token in localStorage
- Auto-attached to all API requests
- 401 redirects to login
- Role-based routing

### Validation
- Frontend: Form validations
- Backend: DTO validations
- CNIC format checking
- Email format checking

---

## 📦 Dependencies

```json
{
  "axios": "Latest",
  "next": "Latest",
  "react": "Latest",
  "lucide-react": "Latest",
  "tailwindcss": "Latest",
  "@radix-ui/react-select": "Latest",
  "@radix-ui/react-label": "Latest"
}
```

---

## 🚀 Deployment

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
```

### Build
```bash
npm run build
```

### Production
```bash
npm run start
```

---

## 📝 Code Examples

### API Call Example
```typescript
import { registerPatient } from "@/lib/api-receptionist";

const response = await registerPatient({
  firstName: "Fatima",
  lastName: "Khan",
  email: "fatima@example.com",
  password: "password123",
  gender: "FEMALE",
  cnic: "12345-1234567-1",
  phoneNumber: "+92-300-1234567"
});

console.log(response.patient.id); // Patient ID
```

### Form Validation Example
```typescript
// CNIC validation
if (!validateCNIC(formData.cnic)) {
  setError("Invalid CNIC format. Use: 12345-1234567-1");
  return;
}

// Email validation
if (!formData.email.trim()) {
  setError("Email is required");
  return;
}

// Password validation
if (formData.password.length < 6) {
  setError("Password must be at least 6 characters");
  return;
}
```

### Filter Example
```typescript
// Apply multiple filters
const appointments = await getMyAppointments(
  "BOOKED",      // status
  "upcoming",    // timeFilter
  "Ahmed"        // patientSearch
);
```

---

## 🎯 Best Practices

### Component Structure
```typescript
// ✅ Good: Separate concerns
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Load data
useEffect(() => {
  loadData();
}, []);

// Render states
if (loading) return <Loader />;
if (error) return <Error message={error} />;
return <DataView data={data} />;
```

### Error Handling
```typescript
try {
  const result = await apiCall();
  setSuccess(true);
} catch (err) {
  console.error("API call failed:", err);
  setError(err.response?.data?.message || "Operation failed");
}
```

### Form State Management
```typescript
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};
```

---

## 📚 Related Documentation

- **Backend APIs**: `hospital-backend/RECEPTIONIST_PORTAL_APIs.md`
- **Implementation Summary**: `hospital-backend/RECEPTIONIST_PORTAL_IMPLEMENTATION_SUMMARY.md`
- **Frontend Details**: `hospital-frontend/RECEPTIONIST_PORTAL_FRONTEND_IMPLEMENTATION.md`
- **Python Test Client**: `hospital-backend-client/receptionist_portal_test.py`

---

## 🤝 Support

### Common Issues
1. **CNIC not formatting**: Type 13 digits continuously
2. **Search not working**: Enter at least 2 characters
3. **No slots available**: Check doctor schedules in database
4. **Can't book**: Ensure patient and slot are selected

### Debug Mode
```typescript
// In api-receptionist.ts, add console.logs
console.log("API Response:", response.data);
console.log("Error:", error.response);
```

---

## ✨ Status

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 23, 2025  

### Completed
- ✅ Dashboard with stats
- ✅ Patient registration
- ✅ Appointment booking
- ✅ Appointments management
- ✅ All filters and search
- ✅ Error handling
- ✅ Loading states
- ✅ Success confirmations

### Future Enhancements
- Patient editing
- Appointment rescheduling
- Check-in system
- SMS notifications
- Print confirmations
- Reports and analytics

---

**Happy coding! 🎉**
