import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnlineAppointmentStatus } from '@prisma/client';
import { CreateOnlineAppointmentDto } from './dto/onlineappointment.dto';

@Injectable()
export class OnlineAppointmentService {
  constructor(private prisma: PrismaService) {}

  async createOnlineAppointment(data: CreateOnlineAppointmentDto) {
    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: data.slotId },
    });

    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.isBooked) throw new BadRequestException('Slot already booked');

    // Past Slot Check
    if (slot.startTime < new Date()) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }

    const onlineAppointment = await this.prisma.$transaction(async (prisma) => {
      const appointment = await prisma.appointment.create({
        data: {
          slotId: data.slotId,
          patientId: data.patientId,
          reason: data.reason,
        },
      });

      const onlineAppointment = await prisma.onlineAppointment.create({
        data: {
          appointmentId: appointment.id,
        },
        include: { appointment: true },
      });

      await prisma.appointmentSlot.update({
        where: { id: data.slotId },
        data: { isBooked: true },
      });

      return onlineAppointment;
    });

    return onlineAppointment;
  }

  async cancelOnlineAppointment(appointmentId: number) {
    const onlineAppointment = await this.prisma.onlineAppointment.findUnique({
      where: { id: appointmentId },
      include: { appointment: true },
    });

    if (!onlineAppointment) {
      throw new NotFoundException('Online appointment not found');
    }

    if (onlineAppointment.status === OnlineAppointmentStatus.CANCELLED) {
      throw new BadRequestException('Online appointment already cancelled');
    }

    const updatedAppointment = await this.prisma.$transaction(
      async (prisma) => {
        await prisma.onlineAppointment.update({
          where: { id: appointmentId },
          data: { status: OnlineAppointmentStatus.CANCELLED },
        });

        await prisma.appointmentSlot.update({
          where: { id: onlineAppointment.appointment.slotId },
          data: { isBooked: false },
        });

        return prisma.onlineAppointment.findUnique({
          where: { id: appointmentId },
          include: { appointment: { include: { slot: true } } },
        });
      },
    );

    return updatedAppointment;
  }
}
