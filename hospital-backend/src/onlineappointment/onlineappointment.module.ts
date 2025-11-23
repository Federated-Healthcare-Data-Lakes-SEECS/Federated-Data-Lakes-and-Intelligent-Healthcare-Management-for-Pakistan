import { Module } from '@nestjs/common';
import { OnlineAppointmentService } from './onlineappointment.service';
import { OnlineAppointmentController } from './onlineappointment.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OnlineAppointmentController],
  providers: [OnlineAppointmentService],
  exports: [OnlineAppointmentService],
})
export class OnlineAppointmentModule {}
