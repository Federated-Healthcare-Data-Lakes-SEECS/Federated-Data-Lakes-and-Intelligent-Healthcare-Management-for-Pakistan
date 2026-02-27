import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LabTestModule } from './labtest/labtest.module';
import { LabTestTemplateModule } from './labtesttemplate/labtesttemplate.module';
import { PatientLabTestModule } from './patientlabtest/patientlabtest.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    LabTestModule,
    LabTestTemplateModule,
    PatientLabTestModule,
  ],
})
export class AppModule {}
