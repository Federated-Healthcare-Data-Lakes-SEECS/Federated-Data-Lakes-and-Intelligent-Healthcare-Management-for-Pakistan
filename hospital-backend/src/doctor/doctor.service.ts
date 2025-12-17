import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';

import {
  RegisterDoctorDto,
  UpdateDoctorDto,
  DoctorResponseDto,
  DoctorDashboardStatsDto,
  UpcomingAppointmentDto,
  BookedAppointmentDto,
} from './dto';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  async registerDoctor(dto: RegisterDoctorDto): Promise<DoctorResponseDto> {
    // 1. Validate department exists
    const department = await this.prisma.department.findUnique({
      where: { name: dto.departmentName },
    });

    if (!department) {
      throw new NotFoundException(
        `Department '${dto.departmentName}' not found`,
      );
    }

    // 2. Check for existing user with same email
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with this email already exists`,
      );
    }

    // 3. Check for existing doctor with same license number
    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });

    if (existingDoctor) {
      throw new ConflictException(
        'Doctor with this license number already exists',
      );
    }

    // 5. Get default password and hash it
    const password = process.env.DEFAULT_PASSWORD as string;
    if (!password) {
      throw new BadRequestException('Default password not configured');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // 6. Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create User
        const user = await prisma.user.create({
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashedPassword,
            gender: dto.gender,
            cnic: dto.cnic,
          },
        });

        // Create Doctor
        const doctor = await prisma.doctor.create({
          data: {
            userId: user.id,
            departmentId: department.id,
            licenseNumber: dto.licenseNumber,
            specialization: dto.specialization,
            experience: dto.experience || 0,
            qualification: dto.qualification,
          },
          include: {
            user: true,
            department: true,
          },
        });

        const role = await prisma.role.findUnique({
          where: { name: 'DOCTOR' },
        });

        if (!role) {
          throw new NotFoundException('Role "DOCTOR" not found');
        }

        const userRole = await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });

        return doctor;
      });

      // 7. Transform and return response
      return this.transformToDoctorResponse(result as DoctorInterface);
    } catch (error) {
      if (error.code === 'P2002') {
        // Prisma unique constraint violation
        throw new ConflictException(
          'A doctor with these credentials already exists',
        );
      }
      throw error;
    }
  }

  async updateDoctor(
    id: number,
    dto: UpdateDoctorDto,
  ): Promise<DoctorResponseDto> {
    // Validate doctor exists
    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!existingDoctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    let departmentId = existingDoctor.departmentId;

    // Validate department if provided
    if (dto.departmentName) {
      const department = await this.prisma.department.findUnique({
        where: { name: dto.departmentName },
      });

      if (!department) {
        throw new NotFoundException(
          `Department '${dto.departmentName}' not found`,
        );
      }
      departmentId = department.id;
    }

    // Check for email uniqueness if being updated
    if (dto.email && dto.email !== existingDoctor.user.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { 
          email: dto.email,
          id: { not: existingDoctor.userId },
        },
      });
      if (existingEmail) {
        throw new ConflictException(
          `Email "${dto.email}" is already registered to another user.`,
        );
      }
    }

    // Check for license number uniqueness if being updated
    if (dto.licenseNumber && dto.licenseNumber !== existingDoctor.licenseNumber) {
      const existingLicense = await this.prisma.doctor.findFirst({
        where: { 
          licenseNumber: dto.licenseNumber,
          id: { not: id },
        },
      });
      if (existingLicense) {
        throw new ConflictException(
          `License number "${dto.licenseNumber}" is already assigned to another doctor.`,
        );
      }
    }

    try {
      // Use transaction for atomic updates
      const result = await this.prisma.$transaction(async (prisma) => {
        // Prepare user update payload
        const userUpdateData: any = {};
        if (dto.firstName) userUpdateData.firstName = dto.firstName.trim();
        if (dto.lastName) userUpdateData.lastName = dto.lastName.trim();
        if (dto.gender) userUpdateData.gender = dto.gender;
        if (dto.email) userUpdateData.email = dto.email.trim();
        if (dto.cnic) userUpdateData.cnic = dto.cnic.trim();

        // Update user if any user-related fields exist
        if (Object.keys(userUpdateData).length > 0) {
          await prisma.user.update({
            where: { id: existingDoctor.userId },
            data: userUpdateData,
          });
        }

        // Prepare doctor update payload
        const doctorUpdateData: any = {
          departmentId: departmentId,
        };

        if (dto.licenseNumber !== undefined) {
          doctorUpdateData.licenseNumber = dto.licenseNumber?.trim();
        }
        if (dto.specialization !== undefined) {
          doctorUpdateData.specialization = dto.specialization?.trim();
        }
        if (dto.experience !== undefined) {
          doctorUpdateData.experience = dto.experience;
        }
        if (dto.qualification !== undefined) {
          doctorUpdateData.qualification = dto.qualification?.trim();
        }

        // Update doctor
        const updatedDoctor = await prisma.doctor.update({
          where: { id },
          data: doctorUpdateData,
          include: { user: true, department: true },
        });

        return updatedDoctor;
      });

      // Transform and return response
      return this.transformToDoctorResponse(result as DoctorInterface);
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (target?.includes('email')) {
          throw new ConflictException('This email is already registered to another user.');
        }
        if (target?.includes('license_number')) {
          throw new ConflictException('This license number is already assigned to another doctor.');
        }
        throw new ConflictException('Update conflicts with existing data');
      }
      throw error;
    }
  }

  async activateDoctor(id: number): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id: doctor.userId },
      data: { isActive: true },
    });

    const updatedDoctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    return this.transformToDoctorResponse(updatedDoctor as DoctorInterface);
  }

  async deactivateDoctor(id: number): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id: doctor.userId },
      data: { isActive: false },
    });

    const updatedDoctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    return this.transformToDoctorResponse(updatedDoctor as DoctorInterface);
  }

  async getAllDoctors(): Promise<DoctorResponseDto[]> {
    const doctors = await this.prisma.doctor.findMany({
      include: { user: true, department: true },
      orderBy: [{ user: { firstName: 'asc' } }, { user: { lastName: 'asc' } }],
    });

    return doctors.map((doctor) =>
      this.transformToDoctorResponse(doctor as DoctorInterface),
    );
  }

  async getDoctorById(id: number): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return this.transformToDoctorResponse(doctor as DoctorInterface);
  }

  async getDoctorsByDepartment(
    departmentName: string,
  ): Promise<DoctorResponseDto[]> {
    const department = await this.prisma.department.findUnique({
      where: { name: departmentName },
    });

    if (!department) {
      throw new NotFoundException(`Department '${departmentName}' not found`);
    }

    const doctors = await this.prisma.doctor.findMany({
      where: { departmentId: department.id },
      include: { user: true, department: true },
      orderBy: [{ user: { firstName: 'asc' } }, { user: { lastName: 'asc' } }],
    });

    return doctors.map((doctor) => this.transformToDoctorResponse(doctor));
  }

  async deleteDoctor(id: number): Promise<{ message: string }> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    try {
      await this.prisma.$transaction(async (prisma) => {
        // Delete doctor first (due to foreign key constraint)
        await prisma.doctor.delete({
          where: { id },
        });

        // Then delete the associated user
        await prisma.user.delete({
          where: { id: doctor.userId },
        });
      });

      return {
        message: `Doctor ${doctor.user.firstName} ${doctor.user.lastName} deleted successfully`,
      };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Cannot delete doctor due to existing references',
        );
      }
      throw error;
    }
  }

  // Doctor Dashboard Methods
  async getDoctorProfile(userId: number): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: { user: true, department: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.transformToDoctorResponse(doctor as DoctorInterface);
  }

  async getDashboardStats(userId: number): Promise<DoctorDashboardStatsDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Get all schedules for this doctor (excluding soft-deleted)
    const schedules = await this.prisma.doctorSchedule.count({
      where: {
        doctorId: doctor.id,
        deletedAt: null,
      },
    });

    // Get all slots for this doctor
    const allSlots = await this.prisma.appointmentSlot.findMany({
      where: {
        schedule: {
          doctorId: doctor.id,
          deletedAt: null,
        },
        deletedAt: null,
      },
    });

    const bookedSlots = allSlots.filter((slot) => slot.isBooked).length;
    const unbookableSlots = allSlots.filter(
      (slot) => !slot.isBookable && !slot.isBooked,
    ).length;
    const availableSlots =
      allSlots.length - bookedSlots - unbookableSlots;

    // Get checkups count
    const checkups = await this.prisma.checkup.count({
      where: {
        appointment: {
          slot: {
            schedule: {
              doctorId: doctor.id,
            },
          },
        },
      },
    });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await this.prisma.appointment.count({
      where: {
        slot: {
          schedule: {
            doctorId: doctor.id,
          },
          startTime: {
            gte: today,
            lt: tomorrow,
          },
        },
      },
    });

    return plainToInstance(
      DoctorDashboardStatsDto,
      {
        schedules,
        bookedSlots,
        availableSlots,
        unbookableSlots,
        checkups,
        todayAppointments,
      },
      { excludeExtraneousValues: true },
    );
  }

  async getUpcomingAppointments(
    userId: number,
    limit: number = 5,
  ): Promise<UpcomingAppointmentDto[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        slot: {
          schedule: {
            doctorId: doctor.id,
            deletedAt: null,
          },
          startTime: {
            gte: new Date(),
          },
          deletedAt: null,
        },
        OR: [
          {
            AND: [
              { onlineAppointment: { isNot: null } },
              { onlineAppointment: { status: { not: 'COMPLETED' } } },
            ],
          },
          {
            AND: [
              { walkinAppointment: { isNot: null } },
              { walkinAppointment: { status: { not: 'COMPLETED' } } },
            ],
          },
        ],
      },
      include: {
        slot: true,
        patient: {
          include: {
            user: true,
          },
        },
        onlineAppointment: true,
        walkinAppointment: true,
      },
      orderBy: {
        slot: {
          startTime: 'asc',
        },
      },
      take: limit,
    });

    return appointments.map((apt) => {
      const isOnline = !!apt.onlineAppointment;
      const status = isOnline 
        ? apt.onlineAppointment?.status 
        : apt.walkinAppointment?.status;
      
      return plainToInstance(
        UpcomingAppointmentDto,
        {
          id: apt.id,
          startTime: apt.slot.startTime,
          endTime: apt.slot.endTime,
          reason: apt.reason || 'Appointment',
          patientName: `${apt.patient.user.firstName} ${apt.patient.user.lastName || ''}`.trim(),
          slotId: apt.slotId,
          appointmentType: isOnline ? 'online' : 'walkin',
          status: status?.toLowerCase(),
          patient: {
            id: apt.patient.id,
            firstName: apt.patient.user.firstName,
            lastName: apt.patient.user.lastName || '',
            dateOfBirth: apt.patient.dateOfBirth,
            bloodGroup: apt.patient.bloodGroup,
            allergies: apt.patient.allergies,
            medicalHistory: apt.patient.medicalHistory,
          },
        },
        { excludeExtraneousValues: true },
      );
    });
  }

  async getRecentCheckups(
    userId: number,
    limit: number = 5,
  ): Promise<any[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const checkups = await this.prisma.checkup.findMany({
      where: {
        appointment: {
          slot: {
            schedule: {
              doctorId: doctor.id,
            },
          },
        },
      },
      include: {
        appointment: {
          include: {
            slot: true,
            patient: {
              include: {
                user: true,
              },
            },
          },
        },
        prescription: {
          include: {
            medications: {
              include: {
                drug: true,
              },
            },
          },
        },
        checkupTestRecommendation: {
          include: {
            recommendedLabTests: {
              include: {
                labTest: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return checkups.map((checkup) => ({
      id: checkup.id,
      appointmentId: checkup.appointmentId,
      diagnosis: checkup.diagnosis,
      symptoms: checkup.symptoms,
      bloodPressure: checkup.bloodPressure,
      temperature: checkup.temperature,
      heartRate: checkup.heartRate,
      bloodSugar: checkup.bloodSugar,
      notes: checkup.notes,
      createdAt: checkup.createdAt,
      medications: checkup.prescription?.medications.map((med) => ({
        drugId: med.drugId,
        dosePerIntake: med.dosePerIntake,
        timesPerDay: med.timesPerDay,
        totalDays: med.totalDays,
        instructions: med.instructions,
        drug: {
          id: med.drug.id,
          name: med.drug.name,
          strength: med.drug.strength,
          dosageForm: med.drug.dosageForm,
          formulaName: med.drug.formulaName,
        },
      })) || [],
      additionalMedications: checkup.prescription?.additionalMedications || null,
      recommendedLabTests: checkup.checkupTestRecommendation?.recommendedLabTests.map((test) => ({
        id: test.id,
        name: test.labTest.name,
      })) || [],
      additionalTests: checkup.checkupTestRecommendation?.additionalTests || null,
      appointment: {
        slot: {
          startTime: checkup.appointment.slot.startTime,
          endTime: checkup.appointment.slot.endTime,
        },
        patient: {
          firstName: checkup.appointment.patient.user.firstName,
          lastName: checkup.appointment.patient.user.lastName || '',
        },
      },
    }));
  }

  async getBookedAppointments(userId: number, filter?: string): Promise<BookedAppointmentDto[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Calculate date range based on filter
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (filter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'nextWeek':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'lastWeek':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'lastMonth':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'lastYear':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      default:
        // Default to today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        slot: {
          schedule: {
            doctorId: doctor.id,
            deletedAt: null,
          },
          deletedAt: null,
          ...(startDate && endDate
            ? {
                startTime: {
                  gte: startDate,
                  lte: endDate,
                },
              }
            : {}),
        },
        // Remove any status filters - fetch ALL appointments
        OR: [
          { onlineAppointment: { isNot: null } },
          { walkinAppointment: { isNot: null } },
        ],
      },
      include: {
        slot: {
          include: {
            schedule: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        onlineAppointment: true,
        walkinAppointment: true,
      },
      orderBy: {
        slot: {
          startTime: 'asc',
        },
      },
    });

    return appointments.map((apt: any) => {
      let status = 'scheduled';
      let appointmentType = 'unknown';
      
      if (apt.onlineAppointment) {
        status = apt.onlineAppointment.status.toLowerCase();
        appointmentType = 'online';
      } else if (apt.walkinAppointment) {
        status = apt.walkinAppointment.status.toLowerCase();
        appointmentType = 'walkin';
      }

      return plainToInstance(
        BookedAppointmentDto,
        {
          id: apt.id,
          patientId: apt.patientId,
          slotId: apt.slotId,
          scheduleId: apt.slot.scheduleId,
          startTime: apt.slot.startTime,
          endTime: apt.slot.endTime,
          reason: apt.reason || 'Appointment',
          status,
          appointmentType,
          patient: {
            id: apt.patient.id,
            firstName: apt.patient.user.firstName,
            lastName: apt.patient.user.lastName || '',
            email: apt.patient.user.email,
            gender: apt.patient.user.gender,
            cnic: apt.patient.user.cnic,
            dateOfBirth: apt.patient.dateOfBirth,
            bloodGroup: apt.patient.bloodGroup,
            medicalHistory: apt.patient.medicalHistory,
            allergies: apt.patient.allergies,
          },
          createdAt: apt.createdAt,
        },
        { excludeExtraneousValues: true },
      );
    });
  }

  // New method to get ALL appointments without date filtering
  async getAllAppointments(userId: number): Promise<BookedAppointmentDto[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        slot: {
          schedule: {
            doctorId: doctor.id,
            deletedAt: null,
          },
          deletedAt: null,
        },
        // Fetch ALL appointments regardless of status
        OR: [
          { onlineAppointment: { isNot: null } },
          { walkinAppointment: { isNot: null } },
        ],
      },
      include: {
        slot: {
          include: {
            schedule: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        onlineAppointment: true,
        walkinAppointment: true,
      },
      orderBy: {
        slot: {
          startTime: 'desc', // Most recent first
        },
      },
    });

    return appointments.map((apt: any) => {
      let status = 'scheduled';
      let appointmentType = 'unknown';
      
      if (apt.onlineAppointment) {
        status = apt.onlineAppointment.status.toLowerCase();
        appointmentType = 'online';
      } else if (apt.walkinAppointment) {
        status = apt.walkinAppointment.status.toLowerCase();
        appointmentType = 'walkin';
      }

      return plainToInstance(
        BookedAppointmentDto,
        {
          id: apt.id,
          patientId: apt.patientId,
          slotId: apt.slotId,
          scheduleId: apt.slot.scheduleId,
          startTime: apt.slot.startTime,
          endTime: apt.slot.endTime,
          reason: apt.reason || 'Appointment',
          status,
          appointmentType,
          patient: {
            id: apt.patient.id,
            firstName: apt.patient.user.firstName,
            lastName: apt.patient.user.lastName || '',
            email: apt.patient.user.email,
            gender: apt.patient.user.gender,
            cnic: apt.patient.user.cnic,
            dateOfBirth: apt.patient.dateOfBirth,
            bloodGroup: apt.patient.bloodGroup,
            medicalHistory: apt.patient.medicalHistory,
            allergies: apt.patient.allergies,
          },
          createdAt: apt.createdAt,
        },
        { excludeExtraneousValues: true },
      );
    });
  }

  async cancelAppointment(appointmentId: number, userId: number) {
    // Verify doctor
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Find the appointment and verify it belongs to this doctor
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        slot: {
          include: {
            schedule: true,
          },
        },
        onlineAppointment: true,
        walkinAppointment: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.slot.schedule.doctorId !== doctor.id) {
      throw new BadRequestException(
        'You do not have permission to cancel this appointment',
      );
    }

    // Check if appointment has an online appointment component
    if (appointment.onlineAppointment) {
      if (appointment.onlineAppointment.status === 'CANCELLED') {
        throw new BadRequestException('Appointment is already cancelled');
      }

      // Update online appointment status to cancelled
      await this.prisma.onlineAppointment.update({
        where: { id: appointment.onlineAppointment.id },
        data: { status: 'CANCELLED' },
      });
    }

    // For walk-in appointments, update status
    if (appointment.walkinAppointment) {
      if (appointment.walkinAppointment.status === 'NOT_ATTENDED') {
        throw new BadRequestException('Appointment is already cancelled');
      }

      await this.prisma.walkinAppointment.update({
        where: { id: appointment.walkinAppointment.id },
        data: { status: 'NOT_ATTENDED' },
      });
    }

    return { success: true, message: 'Appointment cancelled successfully' };
  }

  async getTodaysAppointments(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        slot: {
          schedule: {
            doctorId: doctor.id,
            deletedAt: null,
          },
          startTime: {
            gte: today,
            lt: tomorrow,
          },
          deletedAt: null,
        },
      },
      include: {
        slot: true,
        patient: {
          include: {
            user: true,
          },
        },
        onlineAppointment: true,
        walkinAppointment: true,
        checkup: true,
      },
      orderBy: {
        slot: {
          startTime: 'asc',
        },
      },
    });

    const now = new Date();
    
    const categorized = {
      upcoming: [] as any[],
      completed: [] as any[],
      missed: [] as any[],
      cancelled: [] as any[],
    };

    console.log('Total appointments today:', appointments.length);

    appointments.forEach((apt) => {
      const isOnline = !!apt.onlineAppointment;
      const status = isOnline
        ? apt.onlineAppointment?.status
        : apt.walkinAppointment?.status;
      const isPast = new Date(apt.slot.startTime) < now;

      const appointmentData = {
        id: apt.id,
        patientId: apt.patientId,
        slotId: apt.slotId,
        startTime: apt.slot.startTime,
        endTime: apt.slot.endTime,
        reason: apt.reason || 'Appointment',
        status: status?.toLowerCase(),
        appointmentType: isOnline ? 'online' : 'walkin',
        hasCheckup: !!apt.checkup,
        patient: {
          id: apt.patient.id,
          firstName: apt.patient.user.firstName,
          lastName: apt.patient.user.lastName || '',
          email: apt.patient.user.email,
          gender: apt.patient.user.gender,
          cnic: apt.patient.user.cnic,
          dateOfBirth: apt.patient.dateOfBirth,
          bloodGroup: apt.patient.bloodGroup,
          medicalHistory: apt.patient.medicalHistory,
          allergies: apt.patient.allergies,
        },
        createdAt: apt.createdAt,
      };

      if (status === 'COMPLETED') {
        categorized.completed.push(appointmentData);
      } else if (status === 'CANCELLED' || status === 'NOT_ATTENDED') {
        categorized.cancelled.push(appointmentData);
      } else if (status === 'BOOKED') {
        if (isPast) {
          categorized.missed.push(appointmentData);
        } else {
          categorized.upcoming.push(appointmentData);
        }
      }
    });

    return categorized;
  }

  async getWeeklyStats(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Get start of this week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // adjust when day is Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get completed appointments this week
    const completedThisWeek = await this.prisma.appointment.findMany({
      where: {
        slot: {
          schedule: {
            doctorId: doctor.id,
          },
        },
        OR: [
          {
            onlineAppointment: {
              status: 'COMPLETED',
              updatedAt: { gte: startOfWeek },
            },
          },
          {
            walkinAppointment: {
              status: 'COMPLETED',
              updatedAt: { gte: startOfWeek },
            },
          },
        ],
      },
      distinct: ['patientId'],
    });

    const patientsSeenThisWeek = completedThisWeek.length;

    // Get pending checkups (drafts)
    const pendingCheckups = await this.prisma.checkup.count({
      where: {
        isDraft: true,
        appointment: {
          slot: {
            schedule: {
              doctorId: doctor.id,
            },
          },
        },
      },
    });

    return {
      patientsSeenThisWeek,
      pendingCheckups,
    };
  }

  async getRecentPatients(userId: number, limit: number = 10) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        slot: {
          schedule: {
            doctorId: doctor.id,
            deletedAt: null,
          },
          deletedAt: null,
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        slot: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get unique patients maintaining recency order
    const seenPatientIds = new Set<number>();
    const uniquePatients: any[] = [];

    for (const apt of appointments) {
      if (!seenPatientIds.has(apt.patient.id)) {
        seenPatientIds.add(apt.patient.id);
        
        // Count total appointments for this patient with this doctor
        const appointmentCount = await this.prisma.appointment.count({
          where: {
            patientId: apt.patient.id,
            slot: {
              schedule: {
                doctorId: doctor.id,
              },
            },
          },
        });

        uniquePatients.push({
          id: apt.patient.id,
          firstName: apt.patient.user.firstName,
          lastName: apt.patient.user.lastName || '',
          email: apt.patient.user.email,
          gender: apt.patient.user.gender,
          cnic: apt.patient.user.cnic,
          dateOfBirth: apt.patient.dateOfBirth,
          bloodGroup: apt.patient.bloodGroup,
          medicalHistory: apt.patient.medicalHistory,
          familyHistory: apt.patient.familyHistory,
          allergies: apt.patient.allergies,
          lastAppointmentDate: apt.slot.startTime,
          totalAppointments: appointmentCount,
        });

        if (uniquePatients.length >= limit) {
          break;
        }
      }
    }

    return uniquePatients;
  }

  async getUpcomingSchedule(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Fetch doctor's schedules for today and tomorrow
    const schedules = await this.prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctor.id,
        deletedAt: null,
        OR: [
          {
            // Schedule starts today or tomorrow
            from: {
              gte: today,
              lt: dayAfterTomorrow,
            },
          },
          {
            // Schedule ends today or tomorrow (overlapping schedules)
            to: {
              gte: today,
              lt: dayAfterTomorrow,
            },
          },
          {
            // Schedule spans across today/tomorrow
            AND: [
              { from: { lt: today } },
              { to: { gte: dayAfterTomorrow } },
            ],
          },
        ],
      },
      include: {
        appointmentSlots: {
          where: {
            deletedAt: null,
          },
        },
      },
      orderBy: {
        from: 'asc',
      },
    });

    console.log('Found schedules:', schedules.length);
    if (schedules.length > 0) {
      console.log('First schedule:', {
        id: schedules[0].id,
        from: schedules[0].from,
        to: schedules[0].to,
        noOfSlots: schedules[0].noOfSlots,
        slotsCount: schedules[0].appointmentSlots.length,
      });
    }

    return schedules.map((schedule) => {
      const bookedSlots = schedule.appointmentSlots.filter(slot => slot.isBooked).length;
      const unbookableSlots = schedule.appointmentSlots.filter(slot => !slot.isBookable && !slot.isBooked).length;
      const availableSlots = schedule.appointmentSlots.length - bookedSlots - unbookableSlots;

      return {
        id: schedule.id,
        from: schedule.from?.toISOString() || null,
        to: schedule.to?.toISOString() || null,
        noOfSlots: schedule.noOfSlots,
        totalSlots: schedule.appointmentSlots.length,
        bookedSlots,
        availableSlots,
        unbookableSlots,
      };
    });
  }

  async getPatientDetails(patientId: number, userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Verify that the doctor has treated this patient
    const hasAppointment = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        slot: {
          schedule: {
            doctorId: doctor.id,
          },
        },
      },
    });

    if (!hasAppointment) {
      throw new ForbiddenException('You do not have access to this patient');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Get appointment history with this doctor
    const appointments = await this.prisma.appointment.findMany({
      where: {
        patientId,
        slot: {
          schedule: {
            doctorId: doctor.id,
          },
        },
      },
      include: {
        slot: true,
        checkup: {
          include: {
            prescription: {
              include: {
                medications: {
                  include: {
                    drug: true,
                  },
                },
              },
            },
            checkupTestRecommendation: {
              include: {
                recommendedLabTests: {
                  include: {
                    labTest: true,
                  },
                },
              },
            },
          },
        },
        onlineAppointment: true,
        walkinAppointment: true,
      },
      orderBy: {
        slot: {
          startTime: 'desc',
        },
      },
    });

    return {
      id: patient.id,
      firstName: patient.user.firstName,
      lastName: patient.user.lastName || '',
      email: patient.user.email,
      gender: patient.user.gender,
      cnic: patient.user.cnic,
      dateOfBirth: patient.dateOfBirth,
      bloodGroup: patient.bloodGroup,
      medicalHistory: patient.medicalHistory,
      familyHistory: patient.familyHistory,
      allergies: patient.allergies,
      address: patient.address,
      phoneNumber: patient.phoneNumber,
      emergencyContact: patient.emergencyContact,
      appointments: appointments.map((apt) => ({
        id: apt.id,
        date: apt.slot.startTime,
        reason: apt.reason,
        status: apt.onlineAppointment?.status || apt.walkinAppointment?.status,
        checkup: apt.checkup
          ? {
              diagnosis: apt.checkup.diagnosis,
              symptoms: apt.checkup.symptoms,
              bloodPressure: apt.checkup.bloodPressure,
              temperature: apt.checkup.temperature,
              heartRate: apt.checkup.heartRate,
              bloodSugar: apt.checkup.bloodSugar,
              notes: apt.checkup.notes,
              medications:
                apt.checkup.prescription?.medications.map((med) => ({
                  drugName: med.drug.name,
                  dosePerIntake: med.dosePerIntake,
                  timesPerDay: med.timesPerDay,
                  totalDays: med.totalDays,
                  instructions: med.instructions,
                })) || [],
              labTests:
                apt.checkup.checkupTestRecommendation?.recommendedLabTests.map(
                  (test) => test.labTest.name,
                ) || [],
            }
          : null,
      })),
    };
  }

  // Private helper methods
  private transformToDoctorResponse(
    doctor: DoctorInterface,
  ): DoctorResponseDto {
    const response = plainToInstance(
      DoctorResponseDto,
      {
        id: doctor.id,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        email: doctor.user.email,
        gender: doctor.user.gender,
        cnic: doctor.user.cnic,
        licenseNumber: doctor.licenseNumber,
        specialization: doctor.specialization,
        experience: doctor.experience,
        qualification: doctor.qualification,
        departmentName: doctor.department.name,
        isActive: doctor.user.isActive,
        createdAt: doctor.createdAt,
      },
      { excludeExtraneousValues: true },
    );

    return response;
  }
}

interface DoctorInterface {
  id: number;
  user: {
    firstName: string;
    lastName: string | null;
    email: string;
    gender: string;
    cnic: string | null;
    isActive: boolean;
  };
  licenseNumber: string;
  specialization?: string;
  experience?: number;
  qualification?: string;
  department: {
    name: string;
  };
  createdAt: Date;
}
