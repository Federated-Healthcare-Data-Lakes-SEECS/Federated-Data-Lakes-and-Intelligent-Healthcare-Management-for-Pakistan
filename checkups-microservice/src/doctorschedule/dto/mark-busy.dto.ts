import { IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class MarkBusyDto {
  @Type(() => Date)
  @IsDate()
  busyFrom!: Date;

  @Type(() => Date)
  @IsDate()
  busyTo!: Date;
}

export class RescheduleAppointmentDto {
  @IsNumber()
  targetSlotId!: number;
}
