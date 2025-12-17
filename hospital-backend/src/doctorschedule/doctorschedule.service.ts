import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorScheduleDto } from './dto';

@Injectable()
export class DoctorScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async createDoctorSchedule(userId: number, dto: CreateDoctorScheduleDto) {
    // Check doctor existence
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    // Validation
    if (dto.from.getTime() >= dto.to.getTime()) {
      throw new BadRequestException('"from" must be before "to"');
    }

    // Check if schedule is in the past
    const now = new Date();
    if (dto.from.getTime() < now.getTime()) {
      throw new BadRequestException('Cannot create schedules in the past');
    }

    if (dto.noOfSlots <= 0) {
      throw new BadRequestException('Number of slots must be greater than 0');
    }

    // Check for overlapping schedules
    const existingSchedule = await this.prisma.doctorSchedule.findFirst({
      where: {
        doctorId: doctor.id,
        from: { lte: dto.to },
        to: { gte: dto.from },
        deletedAt: null,
      },
    });

    if (existingSchedule) {
      throw new BadRequestException(
        'Doctor already has a schedule in this time range',
      );
    }

    // Calculate slot length
    const totalMinutes = (dto.to.getTime() - dto.from.getTime()) / (1000 * 60);
    const slotLength = totalMinutes / dto.noOfSlots;

    if (slotLength < 1) {
      throw new BadRequestException('Slot duration too short');
    }

    // Create schedule and slots in a transaction
    const schedule = await this.prisma.$transaction(async (prisma) => {
      const newSchedule = await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor.id,
          from: dto.from,
          to: dto.to,
          noOfSlots: dto.noOfSlots,
        },
      });

      const slots = Array.from({ length: dto.noOfSlots }, (_, i) => {
        const start = new Date(dto.from.getTime() + i * slotLength * 60000);
        const end = new Date(start.getTime() + slotLength * 60000);
        return {
          startTime: start,
          endTime: end,
          scheduleId: newSchedule.id,
        };
      });

      await prisma.appointmentSlot.createMany({ data: slots });

      return newSchedule;
    });

    return schedule;
  }

  async getMyDoctorSchedules(userId: number) {
    // Check doctor existence
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    // Filter to show schedules from past 1 day onwards
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctor.id,
        deletedAt: null,
        from: {
          gte: oneDayAgo,
        },
      },
      include: {
        appointmentSlots: {
          where: { deletedAt: null },
          include: {
            appointments: {
              include: {
                patient: {
                  include: {
                    user: true,
                  },
                },
                walkinAppointment: {
                  select: {
                    status: true,
                  },
                },
                onlineAppointment: {
                  select: {
                    status: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1, // Get only the latest appointment
            },
          },
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { from: 'asc' },
    });
  }

  async getDoctorScheduleById(scheduleId: number) {
    const schedule = await this.prisma.doctorSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        appointmentSlots: {
          where: { deletedAt: null },
          include: {
            appointments: {
              include: {
                patient: {
                  include: {
                    user: true,
                  },
                },
                walkinAppointment: {
                  select: {
                    status: true,
                  },
                },
                onlineAppointment: {
                  select: {
                    status: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1, // Get only the latest appointment
            },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!schedule || schedule.deletedAt) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async toggleSlotBookability(slotId: number, userId: number) {
    // Check doctor existence
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    // Get the slot with schedule info
    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: slotId },
      include: {
        schedule: true,
      },
    });

    if (!slot || slot.deletedAt) {
      throw new NotFoundException('Slot not found');
    }

    // Check if slot belongs to this doctor
    if (slot.schedule.doctorId !== doctor.id) {
      throw new BadRequestException(
        'You do not have permission to modify this slot',
      );
    }

    // Check if slot is already booked
    if (slot.isBooked) {
      throw new BadRequestException(
        'Cannot modify bookability of a booked slot',
      );
    }

    // Toggle the bookability
    const updatedSlot = await this.prisma.appointmentSlot.update({
      where: { id: slotId },
      data: { isBookable: !slot.isBookable },
    });

    return {
      success: true,
      message: `Slot ${updatedSlot.isBookable ? 'enabled' : 'disabled'} for booking`,
      slot: updatedSlot,
    };
  }

  async deleteDoctorScheduleById(scheduleId: number, userId: number) {
    // Check doctor existence
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    // Check if the schedule exists
    const schedule = await this.prisma.doctorSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule || schedule.deletedAt) {
      throw new NotFoundException('Schedule not found');
    }

    // Check if the schedule belongs to the doctor
    if (schedule.doctorId !== doctor.id) {
      throw new BadRequestException(
        'You do not have permission to delete this schedule',
      );
    }

    // Check if there are any booked slots in this schedule
    const bookedSlots = await this.prisma.appointmentSlot.findMany({
      where: { 
        scheduleId,
        isBooked: true,
        deletedAt: null,
      },
    });

    if (bookedSlots.length > 0) {
      throw new BadRequestException(
        'Cannot delete schedule - some slots are already booked',
      );
    }

    // Soft delete the schedule and its slots
    await this.prisma.$transaction(async (prisma) => {
      await prisma.doctorSchedule.update({
        where: { id: scheduleId },
        data: { deletedAt: new Date() },
      });

      await prisma.appointmentSlot.updateMany({
        where: { scheduleId },
        data: { deletedAt: new Date() },
      });
    });

    return { success: true, message: 'Schedule deleted successfully' };
  }
}
