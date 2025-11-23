# Appointment Status Handling - Backend & Frontend Integration

## Date: November 23, 2025

## Overview
Fixed appointment status filtering to handle "all" status and integrated both **Online** and **Walk-in** appointments in the same endpoint with proper type tags.

---

## Problem Statement

### Initial Issues:
1. **Prisma Validation Error**: When frontend sent `status: "all"`, backend tried to pass it directly to Prisma, causing error:
   ```
   Unknown argument `status`. Available options are marked with ?.
   ```

2. **Missing Walk-in Appointments**: Patient appointments endpoint only returned online appointments, not walk-in appointments created by receptionists.

3. **No Appointment Type Indicator**: No way to distinguish between online and walk-in appointments on the frontend.

---

## Solution

### 1. Backend Changes (NestJS)

#### `src/onlineappointment/dto/online-appointment.dto.ts`
Added "all" as a valid status option:

```typescript
export class GetAppointmentsQueryDto {
  @IsOptional()
  @IsString()
  status?: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'NOT_ATTENDED' | 'all';

  @IsOptional()
  @IsString()
  timeFilter?: 'upcoming' | 'past' | 'all';
}
```

#### `src/onlineappointment/onlineappointment.service.ts`
Rewrote `getMyAppointments()` method to:

**Before:**
- Only fetched online appointments
- Passed status directly to Prisma (caused error with "all")
- No appointment type differentiation

**After:**
- Fetches **both** online and walk-in appointments
- Filters by time first, then applies status filter in application code
- Returns appointment type tag for each appointment

```typescript
async getMyAppointments(userId: number, query?: GetAppointmentsQueryDto) {
  // Get patient ID from user
  const patient = await this.prisma.patient.findUnique({
    where: { userId },
  });

  if (!patient) {
    throw new NotFoundException('Patient profile not found');
  }

  const now = new Date();
  
  // Build base where clause
  const where: any = {
    patientId: patient.id,
    OR: [
      { onlineAppointment: { isNot: null } },
      { walkinAppointment: { isNot: null } },
    ],
  };

  // Add time filter
  if (query?.timeFilter === 'upcoming') {
    where.slot = { startTime: { gte: now } };
  } else if (query?.timeFilter === 'past') {
    where.slot = { startTime: { lt: now } };
  }

  // Fetch both online and walkin appointments
  const appointments = await this.prisma.appointment.findMany({
    where,
    include: {
      slot: {
        include: {
          schedule: {
            include: {
              doctor: {
                include: {
                  user: true,
                  department: true,
                },
              },
            },
          },
        },
      },
      onlineAppointment: true,
      walkinAppointment: true,
    },
    orderBy: {
      slot: {
        startTime: 'desc',
      },
    },
  });

  // Map and filter appointments
  let mappedAppointments = appointments.map((apt) => {
    const isOnline = !!apt.onlineAppointment;
    const status = isOnline 
      ? apt.onlineAppointment!.status 
      : apt.walkinAppointment!.status;

    return {
      id: apt.id,
      reason: apt.reason,
      status,
      appointmentType: isOnline ? 'online' : 'walkin',
      startTime: apt.slot.startTime,
      endTime: apt.slot.endTime,
      createdAt: apt.createdAt,
      doctor: {
        id: apt.slot.schedule.doctor.id,
        firstName: apt.slot.schedule.doctor.user.firstName,
        lastName: apt.slot.schedule.doctor.user.lastName,
        email: apt.slot.schedule.doctor.user.email,
        specialization: apt.slot.schedule.doctor.specialization,
        qualification: apt.slot.schedule.doctor.qualification,
        experience: apt.slot.schedule.doctor.experience,
        departmentName: apt.slot.schedule.doctor.department.name,
      },
    };
  });

  // Apply status filter if provided and not "all"
  if (query?.status && query.status !== 'all') {
    mappedAppointments = mappedAppointments.filter(
      (apt) => apt.status === query.status
    );
  }

  return mappedAppointments;
}
```

---

### 2. Frontend Changes (Next.js/React)

#### `lib/api-patient.ts`
No changes needed - types already supported `appointmentType: "online" | "walk-in"`

#### `components/patient/appointments/appointments-list.tsx`
1. **Fixed Status Values**: Changed "confirmed" to "BOOKED", "completed" to "COMPLETED"
2. **Added Appointment Type Badge**: Shows "Online" or "Walk-in" with different colors

```tsx
// Fixed status mapping
if (filter === "upcoming") {
  status = "BOOKED";  // Was: "confirmed"
  timeFilter = "upcoming";
} else if (filter === "completed") {
  status = "COMPLETED";  // Was: "completed"
  timeFilter = "past";
}

// Added appointment type badge
<Badge 
  variant="outline" 
  className={appointment.appointmentType === "online" 
    ? "bg-blue-50 text-blue-700 border-blue-200" 
    : "bg-purple-50 text-purple-700 border-purple-200"}
>
  {appointment.appointmentType === "online" ? "Online" : "Walk-in"}
</Badge>
```

#### `components/patient/dashboard/dashboard-page.tsx`
Added appointment type badge to upcoming appointments display.

---

## Database Schema

### Appointment Structure
```prisma
model Appointment {
  id        Int      @id @default(autoincrement())
  patientId Int
  slotId    Int
  reason    String?
  
  // Relations - ONE appointment can be EITHER online OR walkin
  walkinAppointment WalkinAppointment?
  onlineAppointment OnlineAppointment?
  
  patient   Patient          @relation(...)
  slot      AppointmentSlot  @relation(...)
  checkup   Checkup?
}

// Online Appointment (patient self-booking)
model OnlineAppointment {
  id            Int    @id @default(autoincrement())
  appointmentId Int    @unique
  status        OnlineAppointmentStatus @default(BOOKED)
  
  appointment   Appointment @relation(...)
}

enum OnlineAppointmentStatus {
  BOOKED
  COMPLETED
  CANCELLED    // Only online can be cancelled by patient
  NOT_ATTENDED
}

// Walk-in Appointment (receptionist booking)
model WalkinAppointment {
  id             Int    @id @default(autoincrement())
  appointmentId  Int    @unique
  status         WalkinAppointmentStatus @default(BOOKED)
  receptionistId Int
  
  appointment   Appointment  @relation(...)
  receptionist  Receptionist @relation(...)
}

enum WalkinAppointmentStatus {
  BOOKED
  COMPLETED
  NOT_ATTENDED  // No CANCELLED - walk-ins can't be cancelled online
}
```

---

## Status Mapping

### Valid Status Values

#### Online Appointments:
- `BOOKED` - Confirmed, upcoming appointment
- `COMPLETED` - Checkup done
- `CANCELLED` - Patient cancelled
- `NOT_ATTENDED` - Patient didn't show up

#### Walk-in Appointments:
- `BOOKED` - Registered at reception
- `COMPLETED` - Checkup done
- `NOT_ATTENDED` - Patient didn't show up

#### Special Filter Value:
- `all` - Returns all appointments regardless of status

---

## API Endpoint

### GET `/online-appointments/my-appointments`

**Query Parameters:**
- `status` (optional): `BOOKED` | `COMPLETED` | `CANCELLED` | `NOT_ATTENDED` | `all`
- `timeFilter` (optional): `upcoming` | `past` | `all`

**Response:**
```json
[
  {
    "id": 1,
    "reason": "Regular checkup",
    "status": "BOOKED",
    "appointmentType": "online",
    "startTime": "2025-11-25T10:00:00Z",
    "endTime": "2025-11-25T10:30:00Z",
    "createdAt": "2025-11-23T08:00:00Z",
    "doctor": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "doctor@hospital.com",
      "specialization": "Cardiologist",
      "qualification": "MBBS, MD",
      "experience": 10,
      "departmentName": "Cardiology"
    }
  },
  {
    "id": 2,
    "reason": "Emergency visit",
    "status": "COMPLETED",
    "appointmentType": "walkin",
    "startTime": "2025-11-20T14:00:00Z",
    "endTime": "2025-11-20T14:30:00Z",
    "createdAt": "2025-11-20T13:45:00Z",
    "doctor": { ... }
  }
]
```

---

## Frontend Display

### Appointment Type Badges
- **Online**: Blue badge (`bg-blue-50 text-blue-700`)
- **Walk-in**: Purple badge (`bg-purple-50 text-purple-700`)

### Status Badges
- **BOOKED**: Blue "Confirmed"
- **COMPLETED**: Green "Completed"
- **CANCELLED**: Red "Cancelled"
- **NOT_ATTENDED**: Outline "Not Attended"

---

## Testing Scenarios

### 1. All Appointments (Default)
```
GET /online-appointments/my-appointments?status=all&timeFilter=all
```
- Returns both online and walk-in appointments
- All statuses included
- All time periods included

### 2. Upcoming Appointments
```
GET /online-appointments/my-appointments?status=BOOKED&timeFilter=upcoming
```
- Returns only BOOKED status
- Only future appointments
- Both online and walk-in types

### 3. Completed Appointments
```
GET /online-appointments/my-appointments?status=COMPLETED&timeFilter=past
```
- Returns only COMPLETED status
- Only past appointments
- Both online and walk-in types

### 4. Cancelled Appointments
```
GET /online-appointments/my-appointments?status=CANCELLED&timeFilter=all
```
- Returns only CANCELLED status (online appointments only)
- All time periods
- Walk-in appointments cannot be cancelled

---

## Key Improvements

✅ **Fixed Prisma Error**: "all" status now handled correctly in application code
✅ **Unified Endpoint**: Both online and walk-in appointments in same response
✅ **Type Differentiation**: Clear visual distinction with colored badges
✅ **Correct Status Values**: Using proper enum values (BOOKED, COMPLETED, etc.)
✅ **Better UX**: Patients can see all appointments in one place
✅ **Flexible Filtering**: Status and time filters work independently

---

## Related Files

### Backend:
- `src/onlineappointment/onlineappointment.service.ts` - Main logic
- `src/onlineappointment/dto/online-appointment.dto.ts` - DTO with "all" status
- `prisma/schema.prisma` - Database models

### Frontend:
- `lib/api-patient.ts` - API service (no changes needed)
- `components/patient/appointments/appointments-list.tsx` - List display with badges
- `components/patient/dashboard/dashboard-page.tsx` - Dashboard with badges

---

## Future Enhancements

### Optional Improvements:
1. **Appointment Type Filter**: Add UI toggle to filter by online/walk-in
2. **Bulk Actions**: Select multiple appointments for actions
3. **Appointment Details Modal**: Click to see full appointment details
4. **Prescription Download**: Download prescriptions from completed checkups
5. **Appointment Reminders**: Push notifications for upcoming appointments

---

## Status: ✅ COMPLETE

All status handling issues resolved. Both online and walk-in appointments now work seamlessly with proper filtering and type differentiation.
