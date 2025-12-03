import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
    RegisterPatientDto,
    PatientResponseDto,
    UpdatePatientProfileDto,
} from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PatientService {
    constructor(private prisma: PrismaService) {}

    async registerPatient(dto: RegisterPatientDto, _creatorId: number): Promise<PatientResponseDto> {
        // 1. Check for existing user with same email or CNIC
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { cnic: dto.cnic },
                ],
            },
        });

        if (existingUser) {
            throw new BadRequestException('User with this email or CNIC already exists');
        }

        const password = process.env.DEFAULT_PASSWORD as string;
        if (!password) {
            throw new BadRequestException('Default password is not set in environment variables');
        }
        // 2. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const patient = await this.prisma.$transaction(async (prisma) => {
                // 2. Create the user
                const user = await prisma.user.create({
                    data: {
                        email: dto.email,
                        password: hashedPassword,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        cnic: dto.cnic,
                        gender: dto.gender,
                    },
                });

                // 3. Create the patient profile
                const patient = await prisma.patient.create({
                    data: {
                        userId: user.id,
                        onboardingDone: false,
                    },
                    include: {
                        user: true,
                    },
                });

                const role = await prisma.role.findUnique({
                    where: {
                        name: 'PATIENT',
                    },
                });
                if (!role) {
                    throw new NotFoundException('Role "PATIENT" not found');
                }

                await prisma.userRole.create({
                    data: {
                        userId: user.id,
                        roleId: role.id,
                    },
                });

                return patient;
            });

            return plainToInstance(PatientResponseDto, {
                ...patient.user,
            });
        } catch {
            throw new BadRequestException('Error creating patient');
        }
    }

    async getAllPatients() {
        const patients = await this.prisma.patient.findMany({
            include: {
                user: true,
            },
            orderBy: [
                { user: { firstName: 'asc' } },
                { user: { lastName: 'asc' } },
            ]
        });

        return patients.map(patient => plainToInstance(PatientResponseDto, {
            id: patient.id,
            firstName: patient.user.firstName,
            lastName: patient.user.lastName,
            email: patient.user.email,
            gender: patient.user.gender,
            cnic: patient.user.cnic,
            isActive: patient.user.isActive,
            dateOfBirth: patient.dateOfBirth,
            bloodGroup: patient.bloodGroup,
            medicalHistory: patient.medicalHistory,
            familyHistory: patient.familyHistory,
            allergies: patient.allergies,
            address: patient.address,
            phoneNumber: patient.phoneNumber,
            emergencyContact: patient.emergencyContact,
            onboardingDone: patient.onboardingDone,
            createdAt: patient.user.createdAt,
        }, { excludeExtraneousValues: true }));
    }

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

        return plainToInstance(PatientResponseDto, {
            id: patient.id,
            firstName: patient.user.firstName,
            lastName: patient.user.lastName,
            email: patient.user.email,
            gender: patient.user.gender,
            cnic: patient.user.cnic,
            isActive: patient.user.isActive,
            dateOfBirth: patient.dateOfBirth,
            bloodGroup: patient.bloodGroup,
            medicalHistory: patient.medicalHistory,
            familyHistory: patient.familyHistory,
            allergies: patient.allergies,
            address: patient.address,
            phoneNumber: patient.phoneNumber,
            emergencyContact: patient.emergencyContact,
            onboardingDone: patient.onboardingDone,
            createdAt: patient.user.createdAt,
        }, { excludeExtraneousValues: true });
    }

    async activatePatient(id: number) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        await this.prisma.user.update({
            where: { id: patient.userId },
            data: { isActive: true },
        });

        const updatedPatient = await this.prisma.patient.findUnique({
            where: { id },
            include: { user: true },
        });

        return plainToInstance(PatientResponseDto, {
            id: updatedPatient!.id,
            firstName: updatedPatient!.user.firstName,
            lastName: updatedPatient!.user.lastName,
            email: updatedPatient!.user.email,
            gender: updatedPatient!.user.gender,
            cnic: updatedPatient!.user.cnic,
            isActive: updatedPatient!.user.isActive,
            dateOfBirth: updatedPatient!.dateOfBirth,
            bloodGroup: updatedPatient!.bloodGroup,
            medicalHistory: updatedPatient!.medicalHistory,
            familyHistory: updatedPatient!.familyHistory,
            allergies: updatedPatient!.allergies,
            address: updatedPatient!.address,
            phoneNumber: updatedPatient!.phoneNumber,
            emergencyContact: updatedPatient!.emergencyContact,
            onboardingDone: updatedPatient!.onboardingDone,
            createdAt: updatedPatient!.user.createdAt,
        }, { excludeExtraneousValues: true });
    }

    async deactivatePatient(id: number) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        await this.prisma.user.update({
            where: { id: patient.userId },
            data: { isActive: false },
        });

        const updatedPatient = await this.prisma.patient.findUnique({
            where: { id },
            include: { user: true },
        });

        return plainToInstance(PatientResponseDto, {
            id: updatedPatient!.id,
            firstName: updatedPatient!.user.firstName,
            lastName: updatedPatient!.user.lastName,
            email: updatedPatient!.user.email,
            gender: updatedPatient!.user.gender,
            cnic: updatedPatient!.user.cnic,
            isActive: updatedPatient!.user.isActive,
            dateOfBirth: updatedPatient!.dateOfBirth,
            bloodGroup: updatedPatient!.bloodGroup,
            medicalHistory: updatedPatient!.medicalHistory,
            familyHistory: updatedPatient!.familyHistory,
            allergies: updatedPatient!.allergies,
            address: updatedPatient!.address,
            phoneNumber: updatedPatient!.phoneNumber,
            emergencyContact: updatedPatient!.emergencyContact,
            onboardingDone: updatedPatient!.onboardingDone,
            createdAt: updatedPatient!.user.createdAt,
        }, { excludeExtraneousValues: true });
    }

    async getPatientProfile(userId: number) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId },
            include: {
                user: true,
            },
        });

        if (!patient) {
            throw new NotFoundException('Patient profile not found');
        }

        return {
            id: patient.id,
            userId: patient.userId,
            firstName: patient.user.firstName,
            lastName: patient.user.lastName,
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
            onboardingDone: patient.onboardingDone,
            onboardedAt: patient.onboardedAt,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
        };
    }

    async updatePatientProfile(userId: number, dto: UpdatePatientProfileDto) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId },
        });

        if (!patient) {
            throw new NotFoundException('Patient profile not found');
        }

        const updatedPatient = await this.prisma.patient.update({
            where: { id: patient.id },
            data: {
                ...dto,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                onboardedAt: dto.onboardingDone && !patient.onboardingDone ? new Date() : undefined,
            },
            include: {
                user: true,
            },
        });

        return {
            id: updatedPatient.id,
            userId: updatedPatient.userId,
            firstName: updatedPatient.user.firstName,
            lastName: updatedPatient.user.lastName,
            email: updatedPatient.user.email,
            gender: updatedPatient.user.gender,
            cnic: updatedPatient.user.cnic,
            dateOfBirth: updatedPatient.dateOfBirth,
            bloodGroup: updatedPatient.bloodGroup,
            medicalHistory: updatedPatient.medicalHistory,
            familyHistory: updatedPatient.familyHistory,
            allergies: updatedPatient.allergies,
            address: updatedPatient.address,
            phoneNumber: updatedPatient.phoneNumber,
            emergencyContact: updatedPatient.emergencyContact,
            onboardingDone: updatedPatient.onboardingDone,
            onboardedAt: updatedPatient.onboardedAt,
        };
    }

    async getDashboardStats(userId: number) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId },
        });

        if (!patient) {
            throw new NotFoundException('Patient profile not found');
        }

        const now = new Date();

        // Get upcoming appointments count
        const upcomingAppointmentsCount = await this.prisma.appointment.count({
            where: {
                patientId: patient.id,
                slot: {
                    startTime: {
                        gte: now,
                    },
                },
                onlineAppointment: {
                    status: 'BOOKED',
                },
            },
        });

        // Get completed checkups count
        const completedCheckupsCount = await this.prisma.checkup.count({
            where: {
                appointment: {
                    patientId: patient.id,
                },
            },
        });

        // Get pending lab tests count
        const pendingLabTestsCount = await this.prisma.patientLabTest.count({
            where: {
                patientId: patient.id,
                status: 'PENDING',
            },
        });

        return {
            upcomingAppointments: upcomingAppointmentsCount,
            completedCheckups: completedCheckupsCount,
            pendingLabTests: pendingLabTestsCount,
        };
    }

    async getUpcomingAppointments(userId: number, limit: number = 5) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId },
        });

        if (!patient) {
            throw new NotFoundException('Patient profile not found');
        }

        const now = new Date();

        // Fetch both online and walk-in appointments (exclude COMPLETED)
        const appointments = await this.prisma.appointment.findMany({
            where: {
                patientId: patient.id,
                slot: {
                    startTime: {
                        gte: now,
                    },
                },
                OR: [
                    { 
                        AND: [
                            { onlineAppointment: { isNot: null } },
                            { onlineAppointment: { status: { not: 'COMPLETED' } } }
                        ]
                    },
                    { 
                        AND: [
                            { walkinAppointment: { isNot: null } },
                            { walkinAppointment: { status: { not: 'COMPLETED' } } }
                        ]
                    },
                ],
            },
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
            },
            orderBy: {
                slot: {
                    startTime: 'asc',
                },
            },
            take: limit,
        });

        // Map appointments and determine type
        return appointments.map((apt) => {
            const isOnline = !!apt.onlineAppointment;
            const status = isOnline 
                ? apt.onlineAppointment!.status 
                : apt.walkinAppointment!.status;

            return {
                id: apt.id,
                reason: apt.reason,
                status,
                appointmentType: isOnline ? 'online' : 'walk-in',
                startTime: apt.slot.startTime,
                endTime: apt.slot.endTime,
                doctor: {
                    firstName: apt.slot.schedule.doctor.user.firstName,
                    lastName: apt.slot.schedule.doctor.user.lastName,
                    specialization: apt.slot.schedule.doctor.specialization,
                    departmentName: apt.slot.schedule.doctor.department.name,
                },
            };
        });
    }

    async getRecentCheckups(userId: number, limit: number = 5) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId },
        });

        if (!patient) {
            throw new NotFoundException('Patient profile not found');
        }

        const checkups = await this.prisma.checkup.findMany({
            where: {
                appointment: {
                    patientId: patient.id,
                },
            },
            include: {
                appointment: {
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
                audio: {
                    select: {
                        id: true,
                        processingStatus: true,
                        transcription: true,
                        extractedInfo: true,
                        processedAt: true,
                        errorMessage: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        return checkups.map((checkup) => {
            // Build audio info if audio exists
            const audioInfo = checkup.audio ? {
                id: checkup.audio.id,
                status: checkup.audio.processingStatus,
                transcription: checkup.audio.transcription,
                extractedInfo: checkup.audio.extractedInfo as Record<string, any> | null,
                processedAt: checkup.audio.processedAt,
                errorMessage: checkup.audio.errorMessage,
            } : undefined;

            return {
                id: checkup.id,
                appointmentId: checkup.appointmentId,
                createdAt: checkup.createdAt,
                bloodPressure: checkup.bloodPressure,
                temperature: checkup.temperature,
                heartRate: checkup.heartRate,
                bloodSugar: checkup.bloodSugar,
                symptoms: checkup.symptoms,
                diagnosis: checkup.diagnosis,
                notes: checkup.notes,
                gapAnalysis: checkup.gapAnalysis,
                additionalTests: checkup.checkupTestRecommendation.additionalTests,
                hasAudio: !!checkup.audio,
                audioInfo,
                doctor: {
                    firstName: checkup.appointment.slot.schedule.doctor.user.firstName,
                    lastName: checkup.appointment.slot.schedule.doctor.user.lastName,
                    specialization: checkup.appointment.slot.schedule.doctor.specialization,
                    departmentName: checkup.appointment.slot.schedule.doctor.department.name,
                },
                medications: checkup.prescription.medications.map((med) => ({
                    id: med.id,
                    drugId: med.drug.id,
                    dosePerIntake: med.dosePerIntake,
                    timesPerDay: med.timesPerDay,
                    totalDays: med.totalDays,
                    instructions: med.instructions,
                    drug: {
                        id: med.drug.id,
                        name: med.drug.name,
                        description: med.drug.description,
                    },
                })),
                additionalMedications: checkup.prescription.additionalMedications,
                recommendedLabTests: checkup.checkupTestRecommendation.recommendedLabTests.map((test) => ({
                    id: test.labTest.id,
                    name: test.labTest.name,
                    description: test.labTest.description,
                })),
            };
        });
    }
}
