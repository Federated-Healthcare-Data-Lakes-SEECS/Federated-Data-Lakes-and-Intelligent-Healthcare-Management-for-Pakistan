import { Module } from '@nestjs/common';
import { LabTestController } from './labtest.controller';
import { LabTestService } from './labtest.service';

@Module({
  controllers: [LabTestController],
  providers: [LabTestService],
})
export class LabTestModule {}
