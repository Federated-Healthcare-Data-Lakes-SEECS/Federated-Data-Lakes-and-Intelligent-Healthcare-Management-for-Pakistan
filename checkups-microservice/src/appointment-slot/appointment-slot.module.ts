import { Module } from '@nestjs/common';
import { AppointmentSlotService } from './appointment-slot.service';
import { AppointmentSlotController } from './appointment-slot.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AppointmentSlotController],
  providers: [AppointmentSlotService, PrismaService],
})
export class AppointmentSlotModule {}
