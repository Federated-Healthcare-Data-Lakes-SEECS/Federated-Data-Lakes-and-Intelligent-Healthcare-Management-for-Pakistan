import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CheckupService } from './checkup.service';
import { CreateCheckupDto } from './dto';
import { Checkup } from '@prisma/client';
import { ParseIntPipe } from '@nestjs/common';

@Controller('checkups')
export class CheckupController {
  constructor(private readonly checkupService: CheckupService) {}

  @Post()
  create(@Body() body: CreateCheckupDto): Promise<Checkup> {
    return this.checkupService.createCheckup(body);
  }

  @Get(':id')
  getAllCheckups(
    @Query('doctorId', ParseIntPipe) doctorId: number,
    @Query('patientId', ParseIntPipe) patientId: number,
  ): Promise<Checkup[]> {
    return this.checkupService.getAllCheckups(doctorId, patientId);
  }
}
