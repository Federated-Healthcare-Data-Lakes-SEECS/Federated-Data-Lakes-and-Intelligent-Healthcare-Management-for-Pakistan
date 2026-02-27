import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorScheduleDto, MarkBusyDto, RescheduleAppointmentDto } from './dto';

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

  /**
   * Get available (unbooked, bookable, future) slots for a specific schedule.
   */
  async getAvailableSlotsForSchedule(scheduleId: number, userId: number) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    const schedule = await this.prisma.doctorSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        appointmentSlots: {
          where: {
            deletedAt: null,
            isBookable: true,
            isBooked: false,
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!schedule || schedule.deletedAt) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.doctorId !== doctor.id) {
      throw new BadRequestException('You do not have permission to view this schedule');
    }

    return schedule.appointmentSlots.map((slot) => ({
      id: slot.id,
      scheduleId: slot.scheduleId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBookable: slot.isBookable,
      isBooked: slot.isBooked,
    }));
  }

  /**
   * Reschedule a single appointment to a different slot within the same schedule.
   */
  async rescheduleAppointment(
    appointmentId: number,
    dto: RescheduleAppointmentDto,
    userId: number,
  ) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    // Get the appointment with slot and schedule info
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        slot: {
          include: { schedule: true },
        },
        onlineAppointment: true,
        walkinAppointment: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.slot.schedule.doctorId !== doctor.id) {
      throw new BadRequestException('You do not have permission to reschedule this appointment');
    }

    // Check appointment is still active (booked)
    const isOnline = !!appointment.onlineAppointment;
    const status = isOnline
      ? appointment.onlineAppointment?.status
      : appointment.walkinAppointment?.status;

    if (status !== 'BOOKED') {
      throw new BadRequestException('Only booked appointments can be rescheduled');
    }

    // Get the target slot
    const targetSlot = await this.prisma.appointmentSlot.findUnique({
      where: { id: dto.targetSlotId },
      include: { schedule: true },
    });

    if (!targetSlot || targetSlot.deletedAt) {
      throw new NotFoundException('Target slot not found');
    }

    // Ensure target slot is in the same schedule
    if (targetSlot.scheduleId !== appointment.slot.scheduleId) {
      throw new BadRequestException('Target slot must be in the same schedule');
    }

    // Ensure target slot is available
    if (!targetSlot.isBookable) {
      throw new BadRequestException('Target slot is not bookable');
    }

    if (targetSlot.isBooked) {
      throw new BadRequestException('Target slot is already booked');
    }

    // Perform the reschedule in a transaction
    await this.prisma.$transaction(async (prisma) => {
      // Free up old slot
      await prisma.appointmentSlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });

      // Book new slot
      await prisma.appointmentSlot.update({
        where: { id: dto.targetSlotId },
        data: { isBooked: true },
      });

      // Move appointment to new slot
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { slotId: dto.targetSlotId },
      });
    });

    return {
      success: true,
      message: 'Appointment rescheduled successfully',
      newSlot: {
        id: targetSlot.id,
        startTime: targetSlot.startTime,
        endTime: targetSlot.endTime,
      },
    };
  }

  /**
   * Mark a busy interval and auto-reschedule or cancel overlapping appointments.
   *
   * Algorithm:
   * 1. Find all schedules belonging to this doctor that overlap the busy interval.
   * 2. For each schedule, find slots that overlap the busy interval.
   * 3. Among those overlapping slots, identify booked ones with active appointments.
   * 4. Mark all overlapping slots as unbookable.
   * 5. Find available (unbooked, bookable, non-overlapping) slots in the SAME schedule.
   * 6. Reschedule as many appointments as possible to available slots.
   * 7. Cancel any remaining appointments that can't be rescheduled.
   */
  async markBusyAndReschedule(dto: MarkBusyDto, userId: number) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    if (dto.busyFrom.getTime() >= dto.busyTo.getTime()) {
      throw new BadRequestException('"busyFrom" must be before "busyTo"');
    }

    // Find all non-deleted schedules that overlap with the busy interval
    const schedules = await this.prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctor.id,
        deletedAt: null,
        from: { lt: dto.busyTo },
        to: { gt: dto.busyFrom },
      },
      include: {
        appointmentSlots: {
          where: { deletedAt: null },
          include: {
            appointments: {
              include: {
                onlineAppointment: true,
                walkinAppointment: true,
                patient: {
                  include: { user: true },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (schedules.length === 0) {
      throw new BadRequestException('No schedules found that overlap with the specified busy interval');
    }

    const results = {
      totalRescheduled: 0,
      totalCancelled: 0,
      totalSlotsBlocked: 0,
      details: [] as Array<{
        scheduleId: number;
        rescheduled: Array<{
          appointmentId: number;
          patientName: string;
          fromSlot: { startTime: Date; endTime: Date };
          toSlot: { startTime: Date; endTime: Date };
        }>;
        cancelled: Array<{
          appointmentId: number;
          patientName: string;
          slot: { startTime: Date; endTime: Date };
        }>;
        slotsBlocked: number;
      }>,
    };

    await this.prisma.$transaction(async (prisma) => {
      for (const schedule of schedules) {
        const scheduleResult = {
          scheduleId: schedule.id,
          rescheduled: [] as typeof results.details[0]['rescheduled'],
          cancelled: [] as typeof results.details[0]['cancelled'],
          slotsBlocked: 0,
        };

        // Separate slots into overlapping and non-overlapping with the busy interval
        const overlappingSlots = schedule.appointmentSlots.filter(
          (slot) =>
            slot.startTime < dto.busyTo && slot.endTime > dto.busyFrom,
        );

        const nonOverlappingSlots = schedule.appointmentSlots.filter(
          (slot) =>
            !(slot.startTime < dto.busyTo && slot.endTime > dto.busyFrom),
        );

        // Find booked appointments in overlapping slots that need rescheduling
        const appointmentsToReschedule: Array<{
          appointmentId: number;
          oldSlotId: number;
          patientName: string;
          isOnline: boolean;
          onlineAppointmentId?: number;
          walkinAppointmentId?: number;
          oldSlot: { startTime: Date; endTime: Date };
        }> = [];

        for (const slot of overlappingSlots) {
          if (slot.isBooked && slot.appointments.length > 0) {
            const apt = slot.appointments[0]; // latest appointment
            const isOnline = !!apt.onlineAppointment;
            const status = isOnline
              ? apt.onlineAppointment?.status
              : apt.walkinAppointment?.status;

            // Only reschedule active (BOOKED) appointments
            if (status === 'BOOKED') {
              appointmentsToReschedule.push({
                appointmentId: apt.id,
                oldSlotId: slot.id,
                patientName: `${apt.patient.user.firstName} ${apt.patient.user.lastName || ''}`.trim(),
                isOnline,
                onlineAppointmentId: apt.onlineAppointment?.id,
                walkinAppointmentId: apt.walkinAppointment?.id,
                oldSlot: { startTime: slot.startTime, endTime: slot.endTime },
              });
            }
          }
        }

        // Find available slots in the same schedule (non-overlapping, unbooked, bookable)
        const availableSlots = nonOverlappingSlots.filter(
          (slot) => slot.isBookable && !slot.isBooked,
        );

        // Reschedule appointments to available slots
        const numToReschedule = Math.min(
          appointmentsToReschedule.length,
          availableSlots.length,
        );

        for (let i = 0; i < numToReschedule; i++) {
          const aptInfo = appointmentsToReschedule[i];
          const targetSlot = availableSlots[i];

          // Free old slot
          await prisma.appointmentSlot.update({
            where: { id: aptInfo.oldSlotId },
            data: { isBooked: false },
          });

          // Book new slot
          await prisma.appointmentSlot.update({
            where: { id: targetSlot.id },
            data: { isBooked: true },
          });

          // Move appointment
          await prisma.appointment.update({
            where: { id: aptInfo.appointmentId },
            data: { slotId: targetSlot.id },
          });

          scheduleResult.rescheduled.push({
            appointmentId: aptInfo.appointmentId,
            patientName: aptInfo.patientName,
            fromSlot: aptInfo.oldSlot,
            toSlot: { startTime: targetSlot.startTime, endTime: targetSlot.endTime },
          });
        }

        // Cancel remaining appointments that couldn't be rescheduled
        for (let i = numToReschedule; i < appointmentsToReschedule.length; i++) {
          const aptInfo = appointmentsToReschedule[i];

          if (aptInfo.isOnline && aptInfo.onlineAppointmentId) {
            await prisma.onlineAppointment.update({
              where: { id: aptInfo.onlineAppointmentId },
              data: { status: 'CANCELLED' },
            });
          } else if (aptInfo.walkinAppointmentId) {
            await prisma.walkinAppointment.update({
              where: { id: aptInfo.walkinAppointmentId },
              data: { status: 'NOT_ATTENDED' },
            });
          }

          // Free the old slot
          await prisma.appointmentSlot.update({
            where: { id: aptInfo.oldSlotId },
            data: { isBooked: false },
          });

          scheduleResult.cancelled.push({
            appointmentId: aptInfo.appointmentId,
            patientName: aptInfo.patientName,
            slot: aptInfo.oldSlot,
          });
        }

        // Block all overlapping slots
        for (const slot of overlappingSlots) {
          await prisma.appointmentSlot.update({
            where: { id: slot.id },
            data: { isBookable: false },
          });
          scheduleResult.slotsBlocked++;
        }

        results.totalRescheduled += scheduleResult.rescheduled.length;
        results.totalCancelled += scheduleResult.cancelled.length;
        results.totalSlotsBlocked += scheduleResult.slotsBlocked;
        results.details.push(scheduleResult);
      }
    });

    return {
      success: true,
      message: `Processed busy interval: ${results.totalRescheduled} rescheduled, ${results.totalCancelled} cancelled, ${results.totalSlotsBlocked} slots blocked`,
      ...results,
    };
  }
}
