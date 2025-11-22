import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalkinAppointmentDto } from './dto/walkinappointment.dto';

@Injectable()
export class WalkinAppointmentService {
  constructor(private prisma: PrismaService) {}

  async createWalkinAppointment(data: CreateWalkinAppointmentDto) {
    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: data.slotId },
    });

    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.isBooked) throw new BadRequestException('Slot already booked');

    // Past Slot Check
    if (slot.startTime < new Date()) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }

    const walkinAppointment = await this.prisma.$transaction(async (prisma) => {
      const appointment = await prisma.appointment.create({
        data: {
          slotId: data.slotId,
          patientId: data.patientId,
          reason: data.reason,
        },
      });

      const walkinAppointment = await prisma.walkinAppointment.create({
        data: {
          appointmentId: appointment.id,
          receptionistId: data.createdBy,
        },
        include: { appointment: true },
      });

      await prisma.appointmentSlot.update({
        where: { id: data.slotId },
        data: { isBooked: true },
      });

      return walkinAppointment;
    });

    return walkinAppointment;
  }
}
