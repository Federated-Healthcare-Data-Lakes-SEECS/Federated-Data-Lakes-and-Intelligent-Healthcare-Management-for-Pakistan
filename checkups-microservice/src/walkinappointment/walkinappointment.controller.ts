import { Controller, Post, Body } from '@nestjs/common';
import { WalkinAppointmentService } from './walkinappointment.service';
import { CreateWalkinAppointmentDto } from './dto/walkinappointment.dto';

@Controller('walkinappointments')
export class WalkinAppointmentController {
  constructor(private readonly appointmentService: WalkinAppointmentService) {}

  @Post()
  create(@Body() body: CreateWalkinAppointmentDto) {
    return this.appointmentService.createWalkinAppointment(body);
  }
}
