import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppointmentModule } from './appointment/appointment.module';
import { AppointmentSlotModule } from './appointment-slot/appointment-slot.module';
import { OnlineAppointmentModule } from './onlineappointment/onlineappointment.module';
import { CheckupModule } from './checkup/checkup.module';
import { WalkinAppointmentModule } from './walkinappointment/walkinappointment.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AppointmentModule,
    AppointmentSlotModule,
    OnlineAppointmentModule,
    CheckupModule,
    WalkinAppointmentModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
