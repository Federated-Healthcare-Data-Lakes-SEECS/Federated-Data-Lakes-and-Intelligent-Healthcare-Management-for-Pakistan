import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CheckupController, AudioProcessingAdminController } from './checkup.controller';
import { CheckupService } from './checkup.service';
import { AudioProcessingService } from './audio-processing.service';
import { AudioProcessingJobService } from './audio-processing-job.service';

@Module({
  imports: [HttpModule],
  controllers: [CheckupController, AudioProcessingAdminController],
  providers: [CheckupService, AudioProcessingService, AudioProcessingJobService],
  exports: [CheckupService, AudioProcessingJobService],
})
export class CheckupModule {}
