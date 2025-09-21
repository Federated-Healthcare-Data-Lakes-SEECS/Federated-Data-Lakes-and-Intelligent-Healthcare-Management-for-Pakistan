import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnlineAppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  // Retrieves appointments based on optional filters for doctorId and patientId
  // It returns the latest appointment for the specified patient and doctor, excluding cancelled online appointments
  async getAppointments(filter?: { doctorId?: number; patientId?: number }) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        OR: [
          {
            onlineAppointment: {
              status: { not: OnlineAppointmentStatus.CANCELLED },
            },
          },
          {
            walkinAppointment: { id: { not: undefined } }, // always allowed
          },
        ],
        patientId: filter?.patientId, // optional
        slot: {
          schedule: {
            doctorId: filter?.doctorId, // optional
          },
          isBooked: true,
        },
      },
      orderBy: {
        createdAt: 'desc', // latest first
      },
      take: 1, // if you only want the latest one overall
      include: {
        onlineAppointment: true,
        walkinAppointment: true,
        slot: true,
      },
    });

    if (appointments.length === 0) {
      throw new NotFoundException('No appointments found');
    }

    return appointments;
  }

  async getById(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { slot: true, onlineAppointment: true, walkinAppointment: true },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }
}
