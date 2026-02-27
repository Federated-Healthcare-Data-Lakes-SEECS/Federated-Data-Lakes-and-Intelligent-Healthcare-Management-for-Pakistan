import { IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDoctorScheduleDto {
  @IsNumber()
  noOfSlots: number;

  @Type(() => Date)
  @IsDate()
  from: Date;

  @Type(() => Date)
  @IsDate()
  to: Date;
}
