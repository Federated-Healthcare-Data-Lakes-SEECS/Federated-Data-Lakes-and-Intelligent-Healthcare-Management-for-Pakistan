import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWalkinAppointmentDto {
  @IsNumber()
  slotId: number;

  @IsNumber()
  createdBy: number;

  @IsNumber()
  patientId: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
