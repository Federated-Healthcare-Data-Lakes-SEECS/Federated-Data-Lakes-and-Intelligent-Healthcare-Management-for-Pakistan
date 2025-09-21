import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';

import { ReceptionistResponseDto, RegisterReceptionistDto, UpdateReceptionistDto,  } from './dto';
import { create } from 'domain';

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
}