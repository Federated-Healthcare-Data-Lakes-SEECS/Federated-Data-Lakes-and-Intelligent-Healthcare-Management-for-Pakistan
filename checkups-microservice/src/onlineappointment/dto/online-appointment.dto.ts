import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class BookOnlineAppointmentDto {
  @IsOptional()
  @IsNumber()
  patientId?: number;

  @IsNotEmpty()
  @IsNumber()
  slotId: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CancelAppointmentDto {
  @IsNotEmpty()
  @IsNumber()
  appointmentId: number;
}

export class GetAppointmentsQueryDto {
  @IsOptional()
  @IsString()
  status?: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'NOT_ATTENDED' | 'all';

  @IsOptional()
  @IsString()
  timeFilter?: 'upcoming' | 'past' | 'all';
}
