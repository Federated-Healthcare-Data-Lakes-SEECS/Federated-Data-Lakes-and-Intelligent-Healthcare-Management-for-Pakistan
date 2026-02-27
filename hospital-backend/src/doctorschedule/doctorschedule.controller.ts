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
import { CreateDoctorScheduleDto, MarkBusyDto, RescheduleAppointmentDto } from './dto';
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

  @Get(':id/available-slots')
  getAvailableSlotsForSchedule(
    @Param('id', ParseIntPipe) scheduleId: number,
    @GetUser('id') userId: number,
  ) {
    return this.doctorScheduleService.getAvailableSlotsForSchedule(
      scheduleId,
      userId,
    );
  }

  @Post('mark-busy')
  markBusyAndReschedule(
    @Body(new ValidationPipe({ transform: true })) dto: MarkBusyDto,
    @GetUser('id') userId: number,
  ) {
    return this.doctorScheduleService.markBusyAndReschedule(dto, userId);
  }

  @Patch('appointments/:id/reschedule')
  rescheduleAppointment(
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body(new ValidationPipe({ transform: true })) dto: RescheduleAppointmentDto,
    @GetUser('id') userId: number,
  ) {
    return this.doctorScheduleService.rescheduleAppointment(
      appointmentId,
      dto,
      userId,
    );
  }
}
