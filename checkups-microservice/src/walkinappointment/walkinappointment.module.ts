import { Module } from '@nestjs/common';
import { WalkinAppointmentService } from './walkinappointment.service';
import { WalkinAppointmentController } from './walkinappointment.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [WalkinAppointmentController],
  providers: [WalkinAppointmentService, PrismaService],
})
export class WalkinAppointmentModule {}
