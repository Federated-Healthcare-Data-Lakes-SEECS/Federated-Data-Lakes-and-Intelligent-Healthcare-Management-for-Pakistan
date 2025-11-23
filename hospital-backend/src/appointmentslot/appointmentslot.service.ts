import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentSlotService {
  constructor(private prisma: PrismaService) {}

  async getAvailableSlots(doctorId?: number, departmentId?: number) {
    const now = new Date();

    // Build where clause for schedules
    const scheduleWhere: any = {
      deletedAt: null,
      to: {
        gte: now, // Only future schedules
      },
    };

    if (doctorId) {
      scheduleWhere.doctorId = doctorId;
    } else if (departmentId) {
      scheduleWhere.doctor = {
        departmentId: departmentId,
      };
    }

    // Get schedules with their slots
    const schedules = await this.prisma.doctorSchedule.findMany({
      where: scheduleWhere,
      include: {
        doctor: {
          include: {
            user: true,
            department: true,
          },
        },
        appointmentSlots: {
          where: {
            deletedAt: null,
            isBookable: true,
            isBooked: false,
            startTime: {
              gte: now, // Only future slots
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
      orderBy: {
        from: 'asc',
      },
    });

    // Format the response
    return schedules.map((schedule) => ({
      doctorId: schedule.doctor.id,
      doctorName: `${schedule.doctor.user.firstName} ${schedule.doctor.user.lastName}`,
      specialization: schedule.doctor.specialization,
      qualification: schedule.doctor.qualification,
      experience: schedule.doctor.experience,
      departmentId: schedule.doctor.departmentId,
      departmentName: schedule.doctor.department.name,
      scheduleId: schedule.id,
      scheduleFrom: schedule.from,
      scheduleTo: schedule.to,
      slots: schedule.appointmentSlots.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBookable: slot.isBookable,
        isBooked: slot.isBooked,
      })),
    }));
  }

  async getDoctorAvailableSlots(doctorId: number) {
    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const now = new Date();

    const schedules = await this.prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctorId,
        deletedAt: null,
        to: {
          gte: now,
        },
      },
      include: {
        appointmentSlots: {
          where: {
            deletedAt: null,
            isBookable: true,
            isBooked: false,
            startTime: {
              gte: now,
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
      orderBy: {
        from: 'asc',
      },
    });

    const allSlots = schedules.flatMap((schedule) =>
      schedule.appointmentSlots.map((slot) => ({
        id: slot.id,
        scheduleId: schedule.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBookable: slot.isBookable,
        isBooked: slot.isBooked,
      }))
    );

    return {
      doctor: {
        id: doctor.id,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        email: doctor.user.email,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        departmentId: doctor.departmentId,
        departmentName: doctor.department.name,
        licenseNumber: doctor.licenseNumber,
      },
      totalAvailableSlots: allSlots.length,
      slots: allSlots,
    };
  }

  async getAllDoctorsWithSlots() {
    const now = new Date();

    const doctors = await this.prisma.doctor.findMany({
      include: {
        user: true,
        department: true,
        schedules: {
          where: {
            deletedAt: null,
            to: {
              gte: now,
            },
          },
          include: {
            appointmentSlots: {
              where: {
                deletedAt: null,
                isBookable: true,
                isBooked: false,
                startTime: {
                  gte: now,
                },
              },
            },
          },
        },
      },
      orderBy: [
        { user: { firstName: 'asc' } },
        { user: { lastName: 'asc' } },
      ],
    });

    return doctors.map((doctor) => {
      const allSlots = doctor.schedules.flatMap((schedule) =>
        schedule.appointmentSlots.map((slot) => ({
          id: slot.id,
          scheduleId: schedule.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      );

      return {
        id: doctor.id,
        userId: doctor.userId,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        email: doctor.user.email,
        gender: doctor.user.gender,
        departmentId: doctor.departmentId,
        departmentName: doctor.department.name,
        licenseNumber: doctor.licenseNumber,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        availableSlotsCount: allSlots.length,
        upcomingSlots: allSlots.slice(0, 5), // First 5 upcoming slots
      };
    });
  }
}
