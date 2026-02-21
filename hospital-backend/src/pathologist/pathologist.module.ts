import { Module } from '@nestjs/common';
import { PathologistController } from './pathologist.controller';
import { PathologistService } from './pathologist.service';

@Module({
  controllers: [PathologistController],
  providers: [PathologistService],
  exports: [PathologistService],
})
export class PathologistModule {}
