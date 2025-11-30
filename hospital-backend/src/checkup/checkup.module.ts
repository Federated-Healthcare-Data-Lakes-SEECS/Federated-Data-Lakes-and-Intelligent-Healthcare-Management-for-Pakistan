import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CheckupController } from './checkup.controller';
import { CheckupService } from './checkup.service';
import { AudioProcessingService } from './audio-processing.service';

@Module({
  imports: [HttpModule],
  controllers: [CheckupController],
  providers: [CheckupService, AudioProcessingService],
  exports: [CheckupService],
})
export class CheckupModule {}
