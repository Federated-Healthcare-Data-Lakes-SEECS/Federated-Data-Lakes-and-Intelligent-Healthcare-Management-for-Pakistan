import { Module } from '@nestjs/common';
import { DoctorScheduleController } from './doctorschedule.controller';
import { DoctorScheduleService } from './doctorschedule.service';

@Module({
  controllers: [DoctorScheduleController],
  providers: [DoctorScheduleService],
  exports: [DoctorScheduleService],
})
export class DoctorScheduleModule {}
