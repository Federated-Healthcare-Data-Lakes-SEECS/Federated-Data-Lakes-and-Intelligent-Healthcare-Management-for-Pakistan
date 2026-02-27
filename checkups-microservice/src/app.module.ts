import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CheckupModule } from './checkup/checkup.module';
import { DoctorScheduleModule } from './doctorschedule/doctorschedule.module';
import { AppointmentSlotModule } from './appointmentslot/appointmentslot.module';
import { OnlineAppointmentModule } from './onlineappointment/onlineappointment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    PrismaModule,
    AuthModule,
    CheckupModule,
    DoctorScheduleModule,
    AppointmentSlotModule,
    OnlineAppointmentModule,
  ],
})
export class AppModule {}
