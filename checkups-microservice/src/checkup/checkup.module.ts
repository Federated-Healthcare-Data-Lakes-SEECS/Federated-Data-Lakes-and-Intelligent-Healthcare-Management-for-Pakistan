import { Module } from '@nestjs/common';
import { CheckupService } from './checkup.service';
import { CheckupController } from './checkup.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CheckupController],
  providers: [CheckupService, PrismaService],
})
export class CheckupModule {}
