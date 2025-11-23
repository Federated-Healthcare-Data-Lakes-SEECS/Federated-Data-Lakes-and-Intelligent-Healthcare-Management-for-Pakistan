import { Expose } from 'class-transformer';

export class DoctorDashboardStatsDto {
  @Expose()
  schedules: number;

  @Expose()
  bookedSlots: number;

  @Expose()
  availableSlots: number;

  @Expose()
  unbookableSlots: number;

  @Expose()
  checkups: number;

  @Expose()
  todayAppointments: number;
}

export class UpcomingAppointmentDto {
  @Expose()
  id: number;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  reason: string;

  @Expose()
  patientName: string;

  @Expose()
  slotId: number;
}

export class RecentCheckupDto {
  @Expose()
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  diagnosisPreview: string;

  @Expose()
  slotStart: Date;

  @Expose()
  bloodPressure: string;

  @Expose()
  temperature: string;

  @Expose()
  heartRate: string;

  @Expose()
  bloodSugar: string;

  @Expose()
  patientName: string;
}
