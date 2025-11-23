import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { AppointmentSlotService } from './appointmentslot.service';

@Controller('appointment-slots')
export class AppointmentSlotController {
  constructor(private appointmentSlotService: AppointmentSlotService) {}

  // Public endpoint for patients to view available slots
  @UseGuards(JwtGuard)
  @Get('available')
  getAvailableSlots(
    @Query('doctorId') doctorId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const doctorIdNum = doctorId ? parseInt(doctorId) : undefined;
    const departmentIdNum = departmentId ? parseInt(departmentId) : undefined;
    return this.appointmentSlotService.getAvailableSlots(
      doctorIdNum,
      departmentIdNum,
    );
  }

  @UseGuards(JwtGuard)
  @Get('doctor/:doctorId')
  getDoctorAvailableSlots(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.appointmentSlotService.getDoctorAvailableSlots(doctorId);
  }

  @UseGuards(JwtGuard)
  @Get('doctors-with-slots')
  getAllDoctorsWithSlots() {
    return this.appointmentSlotService.getAllDoctorsWithSlots();
  }
}
