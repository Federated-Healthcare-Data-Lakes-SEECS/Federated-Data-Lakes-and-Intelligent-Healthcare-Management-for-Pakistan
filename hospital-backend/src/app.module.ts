import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { DepartmentModule } from './department/department.module';
import { DoctorModule } from './doctor/doctor.module';
import { ReceptionistModule } from './receptionist/receptionist.module';
import { PatientModule } from './patient/patient.module';
import { DoctorScheduleModule } from './doctorschedule/doctorschedule.module';
import { DrugModule } from './drug/drug.module';
import { LabTestModule } from './labtest/labtest.module';
import { HttpModule } from '@nestjs/axios';
import { LabTestTemplateModule } from './labtesttemplate/labtesttemplate.module';
import { CheckupModule } from './checkup/checkup.module';
import { OnlineAppointmentModule } from './onlineappointment/onlineappointment.module';
import { AppointmentSlotModule } from './appointmentslot/appointmentslot.module';
import { PatientLabTestModule } from './patientlabtest/patientlabtest.module';
import { LabTechnicianModule } from './labtechnician/labtechnician.module';
import { PathologistModule } from './pathologist/pathologist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    AuthModule,
    PrismaModule,
    UserModule,
    DepartmentModule,
    DoctorModule,
    ReceptionistModule,
    PatientModule,
    DoctorScheduleModule,
    DrugModule,
    LabTestModule,
    LabTestTemplateModule,
    CheckupModule,
    OnlineAppointmentModule,
    AppointmentSlotModule,
    PatientLabTestModule,
    LabTechnicianModule,
    PathologistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
