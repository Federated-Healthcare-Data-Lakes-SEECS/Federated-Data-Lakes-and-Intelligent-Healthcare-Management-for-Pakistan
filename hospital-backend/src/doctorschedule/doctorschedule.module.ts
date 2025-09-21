import { Module } from '@nestjs/common';
import { DoctorScheduleController } from './doctorschedule.controller';
import { DoctorScheduleService } from './doctorschedule.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule, // This makes HttpService available for injection
  ],
  controllers: [DoctorScheduleController],
  providers: [DoctorScheduleService],
  exports: [DoctorScheduleService],
})
export class DoctorScheduleModule {}
