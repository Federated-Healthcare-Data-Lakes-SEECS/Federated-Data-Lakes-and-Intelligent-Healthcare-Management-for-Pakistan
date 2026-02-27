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

  // New endpoint: Get doctors with slots for a specific date
  @UseGuards(JwtGuard)
  @Get('doctors-by-date')
  getDoctorsByDate(
    @Query('date') date: string,
    @Query('limit') limit?: string,
    @Query('includeStats') includeStats?: string,
  ) {
    const maxSlots = limit ? parseInt(limit) : 8;
    return this.appointmentSlotService.getDoctorsByDate(date, maxSlots, includeStats === 'true');
  }

  // New endpoint: Get doctors with slots in next 24 hours (for receptionist)
  @UseGuards(JwtGuard)
  @Get('doctors-next-24hours')
  getDoctorsNext24Hours(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const deptId = departmentId ? parseInt(departmentId) : undefined;
    return this.appointmentSlotService.getDoctorsWithNext24HoursSlots(
      search,
      deptId,
    );
  }

  // New endpoint: Get all departments
  @UseGuards(JwtGuard)
  @Get('departments')
  getAllDepartments() {
    return this.appointmentSlotService.getAllDepartments();
  }
}
