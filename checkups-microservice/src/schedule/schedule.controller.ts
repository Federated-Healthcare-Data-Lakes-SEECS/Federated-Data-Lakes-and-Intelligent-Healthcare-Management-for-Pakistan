import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/schedule.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  async create(@Body() body: CreateScheduleDto) {
    return this.scheduleService.createSchedule(body);
  }

  @Get()
  async findAll(@Query('doctorId') doctorId?: string) {
    return this.scheduleService.getSchedules(
      doctorId ? parseInt(doctorId) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.getScheduleById(id);
  }

  @Delete(':id/delete')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Body('doctorId', ParseIntPipe) doctorId: number,
  ) {
    return this.scheduleService.deleteSchedule(id, doctorId);
  }
}
