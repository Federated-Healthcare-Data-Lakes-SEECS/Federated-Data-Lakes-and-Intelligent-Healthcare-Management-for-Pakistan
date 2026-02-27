import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { DepartmentModule } from './department/department.module';
import { DoctorModule } from './doctor/doctor.module';
import { ReceptionistModule } from './receptionist/receptionist.module';
import { PatientModule } from './patient/patient.module';
import { DrugModule } from './drug/drug.module';
import { LabTechnicianModule } from './labtechnician/labtechnician.module';
import { PathologistModule } from './pathologist/pathologist.module';
import { ProxyModule } from './proxy/proxy.module';
import {
  CheckupProxyController,
  AudioProcessingProxyController,
  DoctorScheduleProxyController,
  AppointmentSlotProxyController,
  OnlineAppointmentProxyController,
} from './proxy/checkup-proxy.controller';
import {
  LabTestProxyController,
  LabTestTemplateProxyController,
  PatientLabTestProxyController,
} from './proxy/labtest-proxy.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    DepartmentModule,
    DoctorModule,
    ReceptionistModule,
    PatientModule,
    DrugModule,
    LabTechnicianModule,
    PathologistModule,
    ProxyModule,
  ],
  controllers: [
    AppController,
    // Checkup microservice proxies
    CheckupProxyController,
    AudioProcessingProxyController,
    DoctorScheduleProxyController,
    AppointmentSlotProxyController,
    OnlineAppointmentProxyController,
    // Lab test microservice proxies
    LabTestProxyController,
    LabTestTemplateProxyController,
    PatientLabTestProxyController,
  ],
  providers: [AppService],
})
export class AppModule {}
