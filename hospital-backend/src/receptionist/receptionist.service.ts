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
    ReceptionistResponseDto, 
    RegisterReceptionistDto, 
    UpdateReceptionistDto,
    RegisterPatientDto,
    BookWalkinAppointmentDto,
    GetReceptionistAppointmentsQueryDto,
} from './dto';
import { create } from 'domain';
import { WalkinAppointmentStatus } from '@prisma/client';

@Injectable()
export class ReceptionistService {
    constructor(private prisma: PrismaService) {}
    
    async registerReceptionist(dto: RegisterReceptionistDto) {
        // 1. Check for existing user with same email or CNIC
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { cnic: dto.cnic },
                ],
            },
        });

        if(existingUser) {
            throw new ConflictException('User with this email or CNIC already exists');
        }

        // 2. Hash the password
        const password = process.env.DEFAULT_PASSWORD as string;
        if (!password) {
            throw new BadRequestException('Default password is not set in environment variables');
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            // Use transaction to ensure atomicity
            const receptionist = await this.prisma.$transaction(async (prisma) => {
                // 3. Create the user
                const user = await prisma.user.create({
                    data: {
                        email: dto.email,
                        password: hashedPassword,
                        cnic: dto.cnic,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        gender: dto.gender,
                    },
                });

                // 4. Create the receptionist profile
                const receptionist = await prisma.receptionist.create({
                    data: {
                        userId: user.id,
                        phoneNumber: dto.phoneNumber,
                    },
                    include: {
                        user: true, // Include user data in the response
                    },
                });

                const role = await prisma.role.findUnique({
                    where: {
                        name: 'RECEPTIONIST',
                    },
                });

                if (!role) {
                    throw new NotFoundException('Role "RECEPTIONIST" not found');
                }

                const userRole = await prisma.userRole.create({
                    data: {
                        userId: user.id,
                        roleId: role.id,
                    },
                });

                return receptionist;
            });

            return this.transformReceptionistResponse(receptionist);

        } catch (error) {
            throw new BadRequestException('Error creating receptionist');
        }
    }

    async updateReceptionist(id: number, dto: UpdateReceptionistDto) {
        // 1. Find the receptionist
        const receptionist = await this.prisma.receptionist.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!receptionist) {
            throw new NotFoundException('Receptionist not found');
        }

        try {
            const result = await this.prisma.$transaction(async (prisma) => {
                // 2. Prepare user update data
                const userUpdateData: any = {};
                if (dto.firstName) userUpdateData.firstName = dto.firstName;
                if (dto.lastName) userUpdateData.lastName = dto.lastName;
                if(dto.gender) userUpdateData.gender = dto.gender;

                // 3. Update the user
                const updatedUser = await prisma.user.update({
                    where: { id: receptionist.userId },
                    data: userUpdateData,
                });

                // 4. Prepare receptionist update data
                const receptionistUpdateData: any = {};
                if (dto.phoneNumber) receptionistUpdateData.phoneNumber = dto.phoneNumber;

                // 5. Update the receptionist
                const updatedReceptionist = await prisma.receptionist.update({
                    where: { id },
                    data: receptionistUpdateData,
                    include: { user: true }, // Include user data in the response
                });
                return updatedReceptionist;
            });

            // 6. Transform and return the response
            return this.transformReceptionistResponse(result);
        } catch (error) {
            throw new BadRequestException('Error updating receptionist');
        }
    }

    async getAllReceptionists() {
        const receptionists = await this.prisma.receptionist.findMany({
            include: { user: true },
            orderBy: [
                { user: { firstName: 'asc' } },
                { user: { lastName: 'asc' } },
            ]
        });

        return receptionists.map(this.transformReceptionistResponse);
    }

    async getReceptionistById(id: number) {
        const receptionist = await this.prisma.receptionist.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!receptionist) {
            throw new NotFoundException('Receptionist not found');
        }

        return this.transformReceptionistResponse(receptionist);
    }

    async deleteReceptionist(id: number) {
        const receptionist = await this.prisma.receptionist.findUnique({
            where: { id },
        });

        if (!receptionist) {
            throw new NotFoundException('Receptionist not found');
        }

        try {
            await this.prisma.$transaction(async (prisma) => {
                // Delete the receptionist
                await prisma.receptionist.delete({
                    where: { id },
                });

                // Delete the user associated with the receptionist
                await prisma.user.delete({
                    where: { id: receptionist.userId },
                });
            });

            return { message: 'Receptionist deleted successfully' };
        } catch (error) {
            throw new BadRequestException('Error deleting receptionist');
        }
    }

    private transformReceptionistResponse(receptionist: any): ReceptionistResponseDto {
        const response =  plainToInstance(ReceptionistResponseDto, {
            id: receptionist.id,
            firstName: receptionist.user.firstName,
            lastName: receptionist.user.lastName,
            email: receptionist.user.email,
            cnic: receptionist.user.cnic,
            gender: receptionist.user.gender,
            phoneNumber: receptionist.phoneNumber,
            createdAt: receptionist.user.createdAt,
        });
        return response;
    }

    // ============================================================================
    // PATIENT MANAGEMENT
    // ============================================================================

    /**
     * Register a new patient (receptionist functionality)
     */
    async registerPatient(dto: RegisterPatientDto, receptionistUserId: number) {
        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Get patient role
        const patientRole = await this.prisma.role.findUnique({
            where: { name: 'PATIENT' },
        });

        if (!patientRole) {
            throw new NotFoundException('Patient role not found');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user and patient in transaction
        const result = await this.prisma.$transaction(async (prisma) => {
            // Create user
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

            // Assign patient role
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: patientRole.id,
                },
            });

            // Create patient profile with onboarding marked as done
            const patient = await prisma.patient.create({
                data: {
                    userId: user.id,
                    dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                    bloodGroup: dto.bloodGroup,
                    phoneNumber: dto.phoneNumber,
                    address: dto.address,
                    emergencyContact: dto.emergencyContact,
                    allergies: dto.allergies,
                    medicalHistory: dto.medicalHistory,
                    familyHistory: dto.familyHistory,
                    onboardingDone: true,
                    onboardedAt: new Date(),
                },
            });

            return { user, patient };
        });

        return {
            message: 'Patient registered successfully',
            patient: {
                id: result.patient.id,
                userId: result.user.id,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                email: result.user.email,
                gender: result.user.gender,
                cnic: result.user.cnic,
                dateOfBirth: result.patient.dateOfBirth,
                bloodGroup: result.patient.bloodGroup,
                phoneNumber: result.patient.phoneNumber,
                address: result.patient.address,
                emergencyContact: result.patient.emergencyContact,
                onboardingDone: result.patient.onboardingDone,
            },
        };
    }

    /**
     * Search for existing patients
     */
    async searchPatients(searchTerm: string) {
        const patients = await this.prisma.patient.findMany({
            where: {
                user: {
                    OR: [
                        { firstName: { contains: searchTerm, mode: 'insensitive' } },
                        { lastName: { contains: searchTerm, mode: 'insensitive' } },
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                        { cnic: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
            },
            include: {
                user: true,
            },
            take: 20, // Limit results
            orderBy: {
                user: {
                    firstName: 'asc',
                },
            },
        });

        return patients.map((patient) => ({
            id: patient.id,
            userId: patient.user.id,
            firstName: patient.user.firstName,
            lastName: patient.user.lastName,
            email: patient.user.email,
            gender: patient.user.gender,
            cnic: patient.user.cnic,
            dateOfBirth: patient.dateOfBirth,
            bloodGroup: patient.bloodGroup,
            phoneNumber: patient.phoneNumber,
            address: patient.address,
        }));
    }

    /**
     * Get patient details by ID
     */
    async getPatientById(patientId: number) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                user: true,
            },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        return {
            id: patient.id,
            userId: patient.user.id,
            firstName: patient.user.firstName,
            lastName: patient.user.lastName,
            email: patient.user.email,
            gender: patient.user.gender,
            cnic: patient.user.cnic,
            dateOfBirth: patient.dateOfBirth,
            bloodGroup: patient.bloodGroup,
            phoneNumber: patient.phoneNumber,
            address: patient.address,
            emergencyContact: patient.emergencyContact,
            allergies: patient.allergies,
            medicalHistory: patient.medicalHistory,
            familyHistory: patient.familyHistory,
            onboardingDone: patient.onboardingDone,
        };
    }

    // ============================================================================
    // APPOINTMENT MANAGEMENT
    // ============================================================================

    /**
     * Book a walk-in appointment
     */
    async bookWalkinAppointment(
        dto: BookWalkinAppointmentDto,
        receptionistUserId: number,
    ) {
        // Get receptionist
        const receptionist = await this.prisma.receptionist.findUnique({
            where: { userId: receptionistUserId },
        });

        if (!receptionist) {
            throw new NotFoundException('Receptionist profile not found');
        }

        // Verify patient exists
        const patient = await this.prisma.patient.findUnique({
            where: { id: dto.patientId },
            include: { user: true },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        // Check if slot exists and is available
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

        // Check if slot is in the future or today
        const slotDate = new Date(slot.startTime);
        const now = new Date();
        if (slotDate < now && slotDate.toDateString() !== now.toDateString()) {
            throw new BadRequestException('Cannot book past appointment slots');
        }

        // Create appointment and walk-in appointment in a transaction
        const result = await this.prisma.$transaction(async (prisma) => {
            // Create the base appointment
            const appointment = await prisma.appointment.create({
                data: {
                    patientId: dto.patientId,
                    slotId: dto.slotId,
                    reason: dto.reason,
                },
            });

            // Create the walk-in appointment
            const walkinAppointment = await prisma.walkinAppointment.create({
                data: {
                    appointmentId: appointment.id,
                    receptionistId: receptionist.id,
                    status: WalkinAppointmentStatus.BOOKED,
                },
            });

            // Mark slot as booked
            await prisma.appointmentSlot.update({
                where: { id: dto.slotId },
                data: { isBooked: true },
            });

            return { appointment, walkinAppointment };
        });

        // Return the complete appointment details
        return this.getAppointmentDetails(result.appointment.id);
    }

    /**
     * Get appointments booked by this receptionist
     */
    async getMyAppointments(
        receptionistUserId: number,
        query?: GetReceptionistAppointmentsQueryDto,
    ) {
        // Get receptionist
        const receptionist = await this.prisma.receptionist.findUnique({
            where: { userId: receptionistUserId },
        });

        if (!receptionist) {
            throw new NotFoundException('Receptionist profile not found');
        }

        const now = new Date();

        // Build base where clause
        const where: any = {
            walkinAppointment: {
                receptionistId: receptionist.id,
            },
        };

        // Add time filter
        if (query?.timeFilter === 'upcoming') {
            where.slot = { startTime: { gte: now } };
        } else if (query?.timeFilter === 'past') {
            where.slot = { startTime: { lt: now } };
        }

        // Add patient search filter
        if (query?.patientSearch) {
            where.patient = {
                user: {
                    OR: [
                        { firstName: { contains: query.patientSearch, mode: 'insensitive' } },
                        { lastName: { contains: query.patientSearch, mode: 'insensitive' } },
                        { email: { contains: query.patientSearch, mode: 'insensitive' } },
                    ],
                },
            };
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
                walkinAppointment: true,
                patient: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                slot: {
                    startTime: 'desc',
                },
            },
        });

        // Map appointments
        let mappedAppointments = appointments.map((apt) => ({
            id: apt.id,
            reason: apt.reason,
            status: apt.walkinAppointment?.status,
            appointmentType: 'walkin',
            startTime: apt.slot.startTime,
            endTime: apt.slot.endTime,
            createdAt: apt.createdAt,
            patient: {
                id: apt.patient.id,
                firstName: apt.patient.user.firstName,
                lastName: apt.patient.user.lastName,
                email: apt.patient.user.email,
                phoneNumber: apt.patient.phoneNumber,
                cnic: apt.patient.user.cnic,
            },
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
        }));

        // Apply status filter if provided and not "all"
        if (query?.status && query.status !== 'all') {
            mappedAppointments = mappedAppointments.filter(
                (apt) => apt.status === query.status,
            );
        }

        return mappedAppointments;
    }

    // ============================================================================
    // DASHBOARD
    // ============================================================================

    /**
     * Get receptionist profile
     */
    async getProfile(userId: number) {
        const receptionist = await this.prisma.receptionist.findUnique({
            where: { userId },
            include: {
                user: true,
            },
        });

        if (!receptionist) {
            throw new NotFoundException('Receptionist profile not found');
        }

        return {
            id: receptionist.id,
            userId: receptionist.user.id,
            firstName: receptionist.user.firstName,
            lastName: receptionist.user.lastName,
            email: receptionist.user.email,
            gender: receptionist.user.gender,
            cnic: receptionist.user.cnic,
            phoneNumber: receptionist.phoneNumber,
            experience: receptionist.experience,
            qualification: receptionist.qualification,
        };
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats(receptionistUserId: number) {
        const receptionist = await this.prisma.receptionist.findUnique({
            where: { userId: receptionistUserId },
        });

        if (!receptionist) {
            throw new NotFoundException('Receptionist profile not found');
        }

        const now = new Date();

        // Count today's appointments
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const todayAppointments = await this.prisma.appointment.count({
            where: {
                walkinAppointment: {
                    receptionistId: receptionist.id,
                },
                slot: {
                    startTime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            },
        });

        // Count total appointments booked by this receptionist
        const totalAppointments = await this.prisma.appointment.count({
            where: {
                walkinAppointment: {
                    receptionistId: receptionist.id,
                },
            },
        });

        // Count upcoming appointments
        const upcomingAppointments = await this.prisma.appointment.count({
            where: {
                walkinAppointment: {
                    receptionistId: receptionist.id,
                    status: WalkinAppointmentStatus.BOOKED,
                },
                slot: {
                    startTime: {
                        gte: new Date(),
                    },
                },
            },
        });

        // Count patients registered today
        const patientsRegisteredToday = await this.prisma.patient.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        return {
            todayAppointments,
            totalAppointments,
            upcomingAppointments,
            patientsRegisteredToday,
        };
    }

    // ============================================================================
    // PRIVATE HELPERS
    // ============================================================================

    /**
     * Private helper to get appointment details
     */
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
                walkinAppointment: true,
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
            status: appointment.walkinAppointment?.status,
            appointmentType: 'walkin',
            startTime: appointment.slot.startTime,
            endTime: appointment.slot.endTime,
            createdAt: appointment.createdAt,
            patient: {
                id: appointment.patient.id,
                firstName: appointment.patient.user.firstName,
                lastName: appointment.patient.user.lastName,
                email: appointment.patient.user.email,
                phoneNumber: appointment.patient.phoneNumber,
                cnic: appointment.patient.user.cnic,
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