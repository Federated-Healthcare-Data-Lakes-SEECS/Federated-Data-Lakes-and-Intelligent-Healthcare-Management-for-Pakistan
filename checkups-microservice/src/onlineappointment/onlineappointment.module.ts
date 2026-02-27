import { Module } from '@nestjs/common';
import { OnlineAppointmentService } from './onlineappointment.service';
import { OnlineAppointmentController } from './onlineappointment.controller';

@Module({
  controllers: [OnlineAppointmentController],
  providers: [OnlineAppointmentService],
  exports: [OnlineAppointmentService],
})
export class OnlineAppointmentModule {}
