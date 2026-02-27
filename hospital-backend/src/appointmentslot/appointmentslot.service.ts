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

  async getDoctorsByDate(dateString: string, maxSlotsPerDoctor: number = 8, includeStats: boolean = false) {
    // Parse the date string (YYYY-MM-DD format)
    // Create date in Pakistan timezone (UTC+5)
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create start of day in Pakistan time (00:00:00 PKT = 19:00:00 previous day UTC)
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    startOfDay.setUTCHours(startOfDay.getUTCHours() - 5); // Subtract 5 hours to convert to UTC
    
    // Create end of day in Pakistan time (23:59:59 PKT = 18:59:59 same day UTC)
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    endOfDay.setUTCHours(endOfDay.getUTCHours() - 5); // Subtract 5 hours to convert to UTC

    const now = new Date();

    const doctors = await this.prisma.doctor.findMany({
      include: {
        user: true,
        department: true,
        schedules: {
          where: {
            deletedAt: null,
            to: { gte: now },
            OR: [
              {
                AND: [
                  { from: { gte: startOfDay } },
                  { from: { lt: endOfDay } },
                ],
              },
              {
                AND: [
                  { to: { gt: startOfDay } },
                  { to: { lte: endOfDay } },
                ],
              },
              {
                AND: [
                  { from: { lt: startOfDay } },
                  { to: { gt: endOfDay } },
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
                  gte: startOfDay,
                  lt: endOfDay,
                },
              },
              orderBy: { startTime: 'asc' },
              take: maxSlotsPerDoctor,
            },
          },
        },
      },
      orderBy: [
        { user: { firstName: 'asc' } },
        { user: { lastName: 'asc' } },
      ],
    });

    // --- Stats (only fetched if requested) ---
    const statsMap: Record<number, {
      totalAppointments: number;
      completedCheckups: number;
      returningPatients: number;
    }> = {};

    if (includeStats) {
      const cachedStats = await this.getCachedDoctorStats();
      cachedStats.forEach((row: any) => {
        statsMap[row.doctor_id] = {
          totalAppointments: row.totalAppointments,
          completedCheckups: row.completedCheckups,
          returningPatients: row.returningPatients,
        };
      });
    }

    // --- Format ---
    const defaultStats = {
      totalAppointments: 0,
      completedCheckups: 0,
      returningPatients: 0,
    };

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

        if (allSlots.length === 0) return null;

        allSlots = allSlots.slice(0, maxSlotsPerDoctor);

        const base = {
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

        // Only attach stats if requested — zero impact on existing consumers
        if (!includeStats) return base;

        return {
          ...base,
          stats: statsMap[doctor.id] ?? defaultStats,
        };
      })
      .filter((doctor) => doctor !== null);

    return {
      date: dateString,
      totalDoctors: doctorsWithSlots.length,
      doctors: doctorsWithSlots,
    };
  }

  // --- Cached stats query (5-min TTL) ---
  private statsCache: { data: any[]; expiresAt: number } | null = null;

  private async getCachedDoctorStats() {
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (this.statsCache && now < this.statsCache.expiresAt) {
      return this.statsCache.data;
    }

    const data = await this.prisma.$queryRaw<any[]>`
      SELECT 
        ds.doctor_id,
        COUNT(DISTINCT a.id)::int                                             AS "totalAppointments",
        COUNT(DISTINCT c.id)::int                                             AS "completedCheckups",
        COUNT(DISTINCT CASE WHEN pt.visit_count > 1 THEN a.patient_id END)::int AS "returningPatients"
      FROM doctor_schedules ds
      JOIN appointment_slots s  ON s.schedule_id = ds.id
      JOIN appointments a        ON a.slot_id     = s.id
      LEFT JOIN "Checkup" c      ON c.appointment_id = a.id
      LEFT JOIN (
        SELECT patient_id, doctor_id_ref, COUNT(*) AS visit_count
        FROM (
          SELECT a2.patient_id, ds2.doctor_id AS doctor_id_ref
          FROM appointments a2
          JOIN appointment_slots s2  ON a2.slot_id     = s2.id
          JOIN doctor_schedules  ds2 ON s2.schedule_id = ds2.id
        ) sub
        GROUP BY patient_id, doctor_id_ref
      ) pt ON pt.patient_id = a.patient_id AND pt.doctor_id_ref = ds.doctor_id
      GROUP BY ds.doctor_id
    `;

    this.statsCache = { data, expiresAt: now + FIVE_MINUTES };
    return data;
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
