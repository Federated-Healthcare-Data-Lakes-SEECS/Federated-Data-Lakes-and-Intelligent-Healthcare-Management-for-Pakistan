import { IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDoctorScheduleDto {
  @IsNumber()
  noOfSlots: number;

  @Type(() => Date) // 👈 tells class-transformer how to cast
  @IsDate()
  from: Date;

  @Type(() => Date) // 👈
  @IsDate()
  to: Date;
}
