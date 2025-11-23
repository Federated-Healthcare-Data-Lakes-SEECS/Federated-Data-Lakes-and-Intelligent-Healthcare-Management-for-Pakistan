import { Module } from '@nestjs/common';
import { AppointmentSlotService } from './appointmentslot.service';
import { AppointmentSlotController } from './appointmentslot.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentSlotController],
  providers: [AppointmentSlotService],
  exports: [AppointmentSlotService],
})
export class AppointmentSlotModule {}
