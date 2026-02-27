import { Module } from '@nestjs/common';
import { LabTestTemplateController } from './labtesttemplate.controller';
import { LabTestTemplateService } from './labtesttemplate.service';

@Module({
  controllers: [LabTestTemplateController],
  providers: [LabTestTemplateService],
})
export class LabTestTemplateModule {}
