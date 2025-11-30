import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { MedicalHistoryJobService } from './medical-history-job.service';

@Module({
  imports: [HttpModule],
  controllers: [PatientController],
  providers: [PatientService, MedicalHistoryJobService],
  exports: [MedicalHistoryJobService],
})
export class PatientModule {}