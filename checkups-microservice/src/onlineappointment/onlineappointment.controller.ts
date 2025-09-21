import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { OnlineAppointmentService } from './onlineappointment.service';
import { CreateOnlineAppointmentDto } from './dto/onlineappointment.dto';

@Controller('onlineappointments')
export class OnlineAppointmentController {
  constructor(private readonly appointmentService: OnlineAppointmentService) {}

  @Post()
  create(@Body() body: CreateOnlineAppointmentDto) {
    return this.appointmentService.createOnlineAppointment(body);
  }

  @Patch('cancel/:id')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.cancelOnlineAppointment(id);
  }
}
