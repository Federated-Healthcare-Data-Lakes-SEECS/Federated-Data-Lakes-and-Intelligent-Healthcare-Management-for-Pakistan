import { Module } from '@nestjs/common';
import { LabTechnicianController } from './labtechnician.controller';
import { LabTechnicianService } from './labtechnician.service';

@Module({
  controllers: [LabTechnicianController],
  providers: [LabTechnicianService],
  exports: [LabTechnicianService],
})
export class LabTechnicianModule {}
