import { IsDate, IsNumber } from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  doctorId: number;

  @IsNumber()
  noOfSlots: number;

  @IsDate()
  from: Date;

  @IsDate()
  to: Date;
}
