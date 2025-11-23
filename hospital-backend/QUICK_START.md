# Quick Start Guide - Doctor Portal APIs

## Prerequisites
- PostgreSQL database running
- Node.js installed
- Backend environment variables configured

## Step 1: Database Setup

```bash
cd hospital-backend

# Run migrations
npx prisma migrate dev

# Seed database (if seed file exists)
npx prisma db seed
```

## Step 2: Start Backend Server

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev
```

Server should start on `http://localhost:3000`

## Step 3: Test Authentication

### Create/Login as a Doctor
```bash
# First, you need a doctor account. You can:
# 1. Have an admin create one via POST /doctors/register
# 2. Or use existing seeded data

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "your-password"
  }'

# Response will include:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }
```

Save the `access_token` for subsequent requests.

## Step 4: Test Doctor APIs

### Get Doctor Profile
```bash
curl http://localhost:3000/doctors/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Dashboard Stats
```bash
curl http://localhost:3000/doctors/dashboard/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Upcoming Appointments
```bash
curl http://localhost:3000/doctors/dashboard/upcoming-appointments?limit=5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a Schedule
```bash
curl -X POST http://localhost:3000/doctorschedules \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "2024-12-20T09:00:00.000Z",
    "to": "2024-12-20T12:00:00.000Z",
    "noOfSlots": 6
  }'
```

### Get My Schedules
```bash
curl http://localhost:3000/doctorschedules \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Booked Appointments
```bash
curl http://localhost:3000/doctors/appointments/booked \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a Checkup
```bash
curl -X POST http://localhost:3000/checkups \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": 1,
    "bloodPressure": "120/80",
    "temperature": "98.6",
    "heartRate": "72",
    "bloodSugar": "110",
    "symptoms": "Patient complains of headache",
    "diagnosis": "Tension headache",
    "notes": "Advised rest and hydration",
    "medications": [
      {
        "drugId": 1,
        "dosePerIntake": "500mg",
        "timesPerDay": 2,
        "totalDays": 3,
        "instructions": "Take after meals"
      }
    ],
    "additionalMedications": null,
    "recommendedLabTestIds": [1],
    "additionalTests": null
  }'
```

### Get Checkup History
```bash
curl http://localhost:3000/checkups/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Step 5: Using Postman (Recommended)

### Import Collection
Create a new Postman collection with these requests:

1. **Auth Folder:**
   - POST Login → Save token to environment variable

2. **Doctor Dashboard Folder:**
   - GET Profile
   - GET Stats
   - GET Upcoming Appointments
   - GET Recent Checkups
   - GET Booked Appointments

3. **Schedules Folder:**
   - POST Create Schedule
   - GET My Schedules
   - GET Schedule by ID
   - DELETE Schedule

4. **Checkups Folder:**
   - POST Create Checkup
   - GET Checkup History
   - GET Checkup by ID

### Environment Variables in Postman:
```
BASE_URL: http://localhost:3000
ACCESS_TOKEN: (auto-filled from login response)
```

## Step 6: Frontend Integration

### Update your frontend API service:

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Doctor APIs
export const doctorAPI = {
  getProfile: () => fetchWithAuth('/doctors/profile'),
  getStats: () => fetchWithAuth('/doctors/dashboard/stats'),
  getUpcomingAppointments: (limit = 5) => 
    fetchWithAuth(`/doctors/dashboard/upcoming-appointments?limit=${limit}`),
  getRecentCheckups: (limit = 5) => 
    fetchWithAuth(`/doctors/dashboard/recent-checkups?limit=${limit}`),
  getBookedAppointments: () => 
    fetchWithAuth('/doctors/appointments/booked'),
};

// Schedule APIs
export const scheduleAPI = {
  create: (data: any) => 
    fetchWithAuth('/doctorschedules', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  getAll: () => fetchWithAuth('/doctorschedules'),
  getById: (id: number) => fetchWithAuth(`/doctorschedules/${id}`),
  delete: (id: number) => 
    fetchWithAuth(`/doctorschedules/${id}`, { method: 'DELETE' }),
};

// Checkup APIs
export const checkupAPI = {
  create: (data: any) => 
    fetchWithAuth('/checkups', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  getHistory: () => fetchWithAuth('/checkups/history'),
  getById: (id: number) => fetchWithAuth(`/checkups/${id}`),
};
```

### Replace mock data in components:

```typescript
// Before (with mock data):
import { mockDoctor, mockBookedAppointments } from '@/lib/mock-data';

// After (with real APIs):
import { doctorAPI } from '@/lib/api';

// In your component:
const [doctor, setDoctor] = useState(null);
const [appointments, setAppointments] = useState([]);

useEffect(() => {
  async function loadData() {
    const profile = await doctorAPI.getProfile();
    const appts = await doctorAPI.getBookedAppointments();
    setDoctor(profile);
    setAppointments(appts);
  }
  loadData();
}, []);
```

## Troubleshooting

### Issue: "Unauthorized" error
**Solution:** Make sure you're passing the JWT token in the Authorization header

### Issue: "Doctor not found"
**Solution:** Ensure the logged-in user has a doctor record in the database

### Issue: "Cannot create schedule - overlapping"
**Solution:** Check existing schedules and ensure no time overlap

### Issue: "Cannot create checkup - appointment not found"
**Solution:** Ensure the appointment exists and belongs to the logged-in doctor

### Issue: "Drug not found or inactive"
**Solution:** Check that the drug IDs exist in the drugs table and isActive = true

## Next Steps

1. Test all endpoints with valid data
2. Test error scenarios (invalid IDs, missing fields, etc.)
3. Update frontend to use real APIs
4. Add loading states and error handling in frontend
5. Test end-to-end flow: Login → View Dashboard → Create Schedule → Book Appointment → Create Checkup

## Useful Queries for Testing

```sql
-- Check if doctor exists
SELECT d.*, u.email FROM doctors d 
JOIN users u ON d."userId" = u.id;

-- Check schedules
SELECT * FROM doctor_schedules WHERE "deletedAt" IS NULL;

-- Check appointment slots
SELECT * FROM appointment_slots WHERE "deletedAt" IS NULL;

-- Check appointments
SELECT * FROM appointments;

-- Check checkups
SELECT * FROM checkups;
```
