import { Module } from '@nestjs/common';
import { OnlineAppointmentService } from './onlineappointment.service';
import { OnlineAppointmentController } from './onlineappointment.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [OnlineAppointmentController],
  providers: [OnlineAppointmentService, PrismaService],
})
export class OnlineAppointmentModule {}
