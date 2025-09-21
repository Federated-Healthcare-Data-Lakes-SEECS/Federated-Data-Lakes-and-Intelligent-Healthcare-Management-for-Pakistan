import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  findAll(
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.appointmentService.getAppointments({
      doctorId: doctorId ? +doctorId : undefined,
      patientId: patientId ? +patientId : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.getById(id);
  }
}
