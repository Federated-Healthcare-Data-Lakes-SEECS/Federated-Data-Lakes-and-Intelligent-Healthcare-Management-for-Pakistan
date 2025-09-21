import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOnlineAppointmentDto {
  @IsNumber()
  slotId: number;

  @IsNumber()
  patientId: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
