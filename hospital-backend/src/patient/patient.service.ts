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
} from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PatientService {
    constructor(private prisma: PrismaService) {}

    async registerPatient(dto: RegisterPatientDto, creatorId: number): Promise<PatientResponseDto> {
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
                        createdBy: creatorId,
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

                const userRole = await prisma.userRole.create({
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
        } catch (error) {
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

        return patients.map(patient => plainToInstance(PatientResponseDto, patient.user));
    }
}
