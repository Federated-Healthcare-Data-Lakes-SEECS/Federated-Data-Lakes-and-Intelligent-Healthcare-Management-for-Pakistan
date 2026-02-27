import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookOnlineAppointmentDto, GetAppointmentsQueryDto } from './dto';
import { OnlineAppointmentStatus } from '@prisma/client';

@Injectable()
export class OnlineAppointmentService {
  constructor(private prisma: PrismaService) {}

  async bookAppointment(dto: BookOnlineAppointmentDto, userId: number) {
    let patientId = dto.patientId;

    if (!patientId) {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: userId },
      });

      if (!patient) {
        throw new NotFoundException('Patient profile not found for this user');
      }

      patientId = patient.id;
    } else {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
        include: { user: true },
      });

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      if (patient.userId !== userId) {
        throw new ForbiddenException('You can only book appointments for yourself');
      }
    }

    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: dto.slotId },
      include: {
        schedule: {
          include: {
            doctor: {
              include: {
                user: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Appointment slot not found');
    }

    if (!slot.isBookable) {
      throw new BadRequestException('This slot is not bookable');
    }

    if (slot.isBooked) {
      throw new BadRequestException('This slot is already booked');
    }

    if (new Date(slot.startTime) < new Date()) {
      throw new BadRequestException('Cannot book past appointment slots');
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const appointment = await prisma.appointment.create({
        data: {
          patientId: patientId,
          slotId: dto.slotId,
          reason: dto.reason,
        },
      });

      const onlineAppointment = await prisma.onlineAppointment.create({
        data: {
          appointmentId: appointment.id,
          status: OnlineAppointmentStatus.BOOKED,
        },
      });

      await prisma.appointmentSlot.update({
        where: { id: dto.slotId },
        data: { isBooked: true },
      });

      return { appointment, onlineAppointment };
    });

    return this.getAppointmentDetails(result.appointment.id);
  }

  async getMyAppointments(userId: number, query?: GetAppointmentsQueryDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    const now = new Date();

    const where: any = {
      patientId: patient.id,
      OR: [
        { onlineAppointment: { isNot: null } },
        { walkinAppointment: { isNot: null } },
      ],
    };

    if (query?.timeFilter === 'upcoming') {
      where.slot = { startTime: { gte: now } };
    } else if (query?.timeFilter === 'past') {
      where.slot = { startTime: { lt: now } };
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        slot: {
          include: {
            schedule: {
              include: {
                doctor: {
                  include: {
                    user: true,
                    department: true,
                  },
                },
              },
            },
          },
        },
        onlineAppointment: true,
        walkinAppointment: true,
        checkup: true,
      },
      orderBy: {
        slot: {
          startTime: 'desc',
        },
      },
    });

    let mappedAppointments = appointments.map((apt) => {
      const isOnline = !!apt.onlineAppointment;
      const dbStatus = isOnline
        ? apt.onlineAppointment!.status
        : apt.walkinAppointment!.status;

      const isPast = new Date(apt.slot.startTime) < now;
      let effectiveStatus: 'BOOKED' | 'NOT_ATTENDED' | 'COMPLETED' | 'CANCELLED' | 'CHECKUP_DRAFT' = dbStatus;

      if (isPast && dbStatus === 'BOOKED') {
        effectiveStatus = 'NOT_ATTENDED';
      }

      if (dbStatus === 'BOOKED' && apt.checkup) {
        effectiveStatus = 'CHECKUP_DRAFT';
      }

      return {
        id: apt.id,
        reason: apt.reason,
        status: effectiveStatus,
        appointmentType: isOnline ? 'online' : 'walk-in',
        startTime: apt.slot.startTime,
        endTime: apt.slot.endTime,
        createdAt: apt.createdAt,
        doctor: {
          id: apt.slot.schedule.doctor.id,
          firstName: apt.slot.schedule.doctor.user.firstName,
          lastName: apt.slot.schedule.doctor.user.lastName,
          email: apt.slot.schedule.doctor.user.email,
          specialization: apt.slot.schedule.doctor.specialization,
          qualification: apt.slot.schedule.doctor.qualification,
          experience: apt.slot.schedule.doctor.experience,
          departmentName: apt.slot.schedule.doctor.department.name,
        },
      };
    });

    if (query?.status && query.status !== 'all') {
      mappedAppointments = mappedAppointments.filter(
        (apt) => apt.status === query.status || (apt.status === 'CHECKUP_DRAFT' && query.status === 'BOOKED')
      );
    }

    return mappedAppointments;
  }

  async cancelAppointment(appointmentId: number, userId: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        onlineAppointment: true,
        slot: true,
        checkup: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.patient.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    if (!appointment.onlineAppointment) {
      throw new BadRequestException('This is not an online appointment');
    }

    if (appointment.onlineAppointment.status === OnlineAppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    if (appointment.onlineAppointment.status === OnlineAppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }

    if (appointment.checkup) {
      throw new BadRequestException('Cannot cancel appointment - checkup has already been completed');
    }

    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    if (new Date(appointment.slot.startTime) < oneHourFromNow) {
      throw new BadRequestException('Cannot cancel appointment less than 1 hour before scheduled time');
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.onlineAppointment.update({
        where: { id: appointment.onlineAppointment!.id },
        data: { status: OnlineAppointmentStatus.CANCELLED },
      });

      await prisma.appointmentSlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });
    });

    return {
      message: 'Appointment cancelled successfully',
      appointment: await this.getAppointmentDetails(appointmentId),
    };
  }

  private async getAppointmentDetails(appointmentId: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        slot: {
          include: {
            schedule: {
              include: {
                doctor: {
                  include: {
                    user: true,
                    department: true,
                  },
                },
              },
            },
          },
        },
        onlineAppointment: true,
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return {
      id: appointment.id,
      reason: appointment.reason,
      status: appointment.onlineAppointment?.status,
      appointmentType: 'online',
      startTime: appointment.slot.startTime,
      endTime: appointment.slot.endTime,
      createdAt: appointment.createdAt,
      patient: {
        id: appointment.patient.id,
        firstName: appointment.patient.user.firstName,
        lastName: appointment.patient.user.lastName,
        email: appointment.patient.user.email,
      },
      doctor: {
        id: appointment.slot.schedule.doctor.id,
        firstName: appointment.slot.schedule.doctor.user.firstName,
        lastName: appointment.slot.schedule.doctor.user.lastName,
        email: appointment.slot.schedule.doctor.user.email,
        specialization: appointment.slot.schedule.doctor.specialization,
        qualification: appointment.slot.schedule.doctor.qualification,
        experience: appointment.slot.schedule.doctor.experience,
        departmentName: appointment.slot.schedule.doctor.department.name,
      },
    };
  }
}
