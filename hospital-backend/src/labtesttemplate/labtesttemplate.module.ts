import { Module } from '@nestjs/common';
import { LabTestTemplateController } from './labtesttemplate.controller';
import { LabTestTemplateService } from './labtesttemplate.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LabTestTemplateController],
  providers: [LabTestTemplateService, PrismaService],
})
export class LabTestTemplateModule {}
