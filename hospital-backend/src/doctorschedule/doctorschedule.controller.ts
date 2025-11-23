import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { GetUser } from '../auth/decorators';
import { DoctorScheduleService } from './doctorschedule.service';
import { CreateDoctorScheduleDto } from './dto';
import { ValidationPipe } from '@nestjs/common';

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
@Controller('doctorschedules')
export class DoctorScheduleController {
  constructor(private readonly doctorScheduleService: DoctorScheduleService) {}

  @Post()
  createDoctorSchedule(
    @Body(new ValidationPipe({ transform: true })) dto: CreateDoctorScheduleDto,
    @GetUser('id') userId: number,
  ) {
    return this.doctorScheduleService.createDoctorSchedule(userId, dto);
  }

  @Get()
  getMyDoctorSchedules(@GetUser('id') userId: number) {
    return this.doctorScheduleService.getMyDoctorSchedules(userId);
  }

  @Get(':id')
  getDoctorScheduleById(@Param('id', ParseIntPipe) scheduleId: number) {
    return this.doctorScheduleService.getDoctorScheduleById(scheduleId);
  }

  @Patch('slots/:slotId/toggle-bookability')
  toggleSlotBookability(
    @Param('slotId', ParseIntPipe) slotId: number,
    @GetUser('id') userId: number,
  ) {
    return this.doctorScheduleService.toggleSlotBookability(slotId, userId);
  }

  @Delete(':id')
  deleteDoctorScheduleById(
    @Param('id', ParseIntPipe) scheduleId: number,
    @GetUser('id') userId: number,
  ) {
    return this.doctorScheduleService.deleteDoctorScheduleById(
      scheduleId,
      userId,
    );
  }
}
