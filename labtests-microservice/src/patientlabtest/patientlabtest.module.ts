import { Module } from '@nestjs/common';
import { PatientLabTestController } from './patientlabtest.controller';
import { PatientLabTestService } from './patientlabtest.service';

@Module({
  controllers: [PatientLabTestController],
  providers: [PatientLabTestService],
  exports: [PatientLabTestService],
})
export class PatientLabTestModule {}
