import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AppointmentSlotService } from './appointment-slot.service';

@Controller('slots')
export class AppointmentSlotController {
  constructor(private readonly slotService: AppointmentSlotService) {}

  @Get('/:id')
  getSlot(@Param('id', ParseIntPipe) id: number) {
    return this.slotService.getSlotById(id);
  }

  @Get('/:id/availability')
  checkAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.slotService.isSlotAvailable(id);
  }

  @Get('/doctor/:doctorId/available')
  getDoctorAvailableSlots(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.slotService.getDoctorAvailableSlots(doctorId);
  }
}
