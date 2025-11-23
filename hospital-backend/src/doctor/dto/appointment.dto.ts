import { Expose, Type } from 'class-transformer';

export class PatientInfoDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  dateOfBirth: Date;

  @Expose()
  bloodGroup: string;

  @Expose()
  medicalHistory: string;

  @Expose()
  allergies: string;
}

export class AppointmentSlotDto {
  @Expose()
  id: number;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  isBookable: boolean;

  @Expose()
  isBooked: boolean;
}

export class BookedAppointmentDto {
  @Expose()
  id: number;

  @Expose()
  patientId: number;

  @Expose()
  slotId: number;

  @Expose()
  scheduleId: number;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  reason: string;

  @Expose()
  status: string;

  @Expose()
  @Type(() => PatientInfoDto)
  patient: PatientInfoDto;

  @Expose()
  createdAt: Date;
}
