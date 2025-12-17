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
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

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
              lt: tomorrow,
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
      totalAvailableSlots: allSlots.length > 5 ? 5 : allSlots.length,
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

  /**
   * Get doctors with available slots for a specific date
   * Optimized for patient booking with date filtering and slot limiting
   */
  async getDoctorsByDate(dateString: string, maxSlotsPerDoctor: number = 8) {
    // Parse the date and set time boundaries
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    const now = new Date();

    // Fetch doctors with schedules that have slots on the selected date
    const doctors = await this.prisma.doctor.findMany({
      include: {
        user: true,
        department: true,
        schedules: {
          where: {
            deletedAt: null,
            to: {
              gte: now, // Schedule must be active
            },
            // Schedule must overlap with selected date
            OR: [
              {
                AND: [
                  { from: { gte: selectedDate } },
                  { from: { lt: nextDay } },
                ],
              },
              {
                AND: [
                  { to: { gt: selectedDate } },
                  { to: { lte: nextDay } },
                ],
              },
              {
                AND: [
                  { from: { lt: selectedDate } },
                  { to: { gt: nextDay } },
                ],
              },
            ],
          },
          include: {
            appointmentSlots: {
              where: {
                deletedAt: null,
                isBookable: true,
                isBooked: false,
                startTime: {
                  gte: selectedDate,
                  lt: nextDay,
                },
              },
              orderBy: {
                startTime: 'asc',
              },
              take: maxSlotsPerDoctor, // Limit slots per doctor
            },
          },
        },
      },
      orderBy: [
        { user: { firstName: 'asc' } },
        { user: { lastName: 'asc' } },
      ],
    });

    // Filter and format doctors that have available slots
    const doctorsWithSlots = doctors
      .map((doctor) => {
        let allSlots = doctor.schedules.flatMap((schedule) =>
          schedule.appointmentSlots.map((slot) => ({
            id: slot.id,
            scheduleId: schedule.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        );

        // Only return doctors with available slots
        if (allSlots.length === 0) {
          return null;
        }

        allSlots = allSlots.slice(0, maxSlotsPerDoctor);

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
          slots: allSlots,
        };
      })
      .filter((doctor) => doctor !== null);

    return {
      date: dateString,
      totalDoctors: doctorsWithSlots.length,
      doctors: doctorsWithSlots,
    };
  }

  /**
   * Get doctors with available slots in next 24 hours
   * For receptionist booking - optimized with search and filters
   */
  async getDoctorsWithNext24HoursSlots(
    searchTerm?: string,
    departmentId?: number,
  ) {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Build doctor where clause
    const doctorWhere: any = {};
    
    if (departmentId) {
      doctorWhere.departmentId = departmentId;
    }

    // Fetch doctors with schedules that have slots in next 24 hours
    const doctors = await this.prisma.doctor.findMany({
      where: doctorWhere,
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
                  lt: next24Hours,
                },
              },
              orderBy: {
                startTime: 'asc',
              },
              take: 6, // Limit to 6 slots per doctor
            },
          },
        },
      },
      orderBy: [
        { user: { firstName: 'asc' } },
        { user: { lastName: 'asc' } },
      ],
    });

    // Filter by search term if provided
    let filteredDoctors = doctors;
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filteredDoctors = doctors.filter((doctor) => {
        const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
        const specialization = doctor.specialization.toLowerCase();
        const departmentName = doctor.department.name.toLowerCase();
        
        return (
          fullName.includes(search) ||
          specialization.includes(search) ||
          departmentName.includes(search)
        );
      });
    }

    // Filter and format doctors that have available slots
    const doctorsWithSlots = filteredDoctors
      .map((doctor) => {
        let allSlots = doctor.schedules.flatMap((schedule) =>
          schedule.appointmentSlots.map((slot) => ({
            id: slot.id,
            scheduleId: schedule.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBookable: slot.isBookable,
            isBooked: slot.isBooked,
          }))
        );

        // Only return doctors with available slots
        if (allSlots.length === 0) {
          return null;
        }

        allSlots = allSlots.slice(0, 6);

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
          upcomingSlots: allSlots,
        };
      })
      .filter((doctor) => doctor !== null);

    return doctorsWithSlots;
  }

  /**
   * Get all departments
   */
  async getAllDepartments() {
    const departments = await this.prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return departments;
  }
}
