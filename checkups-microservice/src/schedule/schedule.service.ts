import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async createSchedule(data: CreateScheduleDto) {
    if (data.from.getTime() >= data.to.getTime())
      throw new BadRequestException('"from" must be before "to"');

    if (data.noOfSlots <= 0)
      throw new BadRequestException('Number of slots must be greater than 0');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: data.doctorId },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    // check if the doctor already has a schedule overlapping with the new one
    const existingSchedule = await this.prisma.doctorSchedule.findFirst({
      where: {
        doctorId: data.doctorId,
        from: { lte: data.to },
        to: { gte: data.from },
      },
    });

    if (existingSchedule)
      throw new BadRequestException(
        'Doctor already has a schedule in this time range',
      );

    // calculate slot length
    const totalMinutes =
      (data.to.getTime() - data.from.getTime()) / (1000 * 60);
    const slotLength = totalMinutes / data.noOfSlots;

    if (slotLength < 1)
      throw new BadRequestException('Slot duration too short');

    const result = await this.prisma.$transaction(async (prisma) => {
      const schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId: data.doctorId,
          from: data.from,
          to: data.to,
          noOfSlots: data.noOfSlots,
        },
      });

      const slots = Array.from({ length: data.noOfSlots }, (_, i) => {
        const start = new Date(data.from.getTime() + i * slotLength * 60000);
        const end = new Date(start.getTime() + slotLength * 60000);
        return {
          startTime: start,
          endTime: end,
          scheduleId: schedule.id,
        };
      });

      await prisma.appointmentSlot.createMany({ data: slots });

      return schedule;
    });

    const schedule = result;

    return schedule;
  }

  async getSchedules(doctorId?: number) {
    return this.prisma.doctorSchedule.findMany({
      where: doctorId ? { doctorId } : undefined,
      include: { appointmentSlots: true },
      orderBy: { from: 'asc' },
    });
  }

  async getScheduleById(id: number) {
    const schedule = await this.prisma.doctorSchedule.findUnique({
      where: { id },
      include: { appointmentSlots: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    return schedule;
  }

  async deleteSchedule(id: number, doctorId: number) {
    // Check if the schedule exists
    const schedule = await this.prisma.doctorSchedule.findUnique({
      where: { id },
    });

    if (!schedule) throw new NotFoundException('Schedule not found');

    // Check if the schedule belongs to the doctor
    if (schedule.doctorId !== doctorId)
      throw new BadRequestException(
        'You do not have permission to delete this schedule',
      );

    // Check if there are any appointments linked to this schedule
    const appointments = await this.prisma.appointment.findMany({
      where: { slot: { scheduleId: id } },
    });

    if (appointments.length > 0)
      throw new BadRequestException(
        'Cannot delete schedule with existing appointments',
      );

    // Delete the schedule
    await this.prisma.doctorSchedule.delete({
      where: { id },
    });

    return { success: true, message: 'Schedule deleted successfully' };
  }
}
