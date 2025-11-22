import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentSlotService {
  constructor(private prisma: PrismaService) {}

  async getSlotById(id: number) {
    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id },
    });
    if (!slot) throw new NotFoundException('Slot not found');
    return slot;
  }

  async isSlotAvailable(slotId: number) {
    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) throw new NotFoundException('Slot not found');

    return { slotId, available: slot.isBooked === false };
  }

  async getDoctorAvailableSlots(doctorId: number) {
    const slots = await this.prisma.appointmentSlot.findMany({
      where: {
        schedule: {
          doctorId,
        },
        isBooked: false,
      },
      include: {
        schedule: true,
      },
    });

    if (slots.length === 0)
      throw new NotFoundException('No available slots found');

    return slots;
  }
}
