import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';

import { RegisterDoctorDto, UpdateDoctorDto, DoctorResponseDto } from './dto';

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

    try {
      // Use transaction for atomic updates
      const result = await this.prisma.$transaction(async (prisma) => {
        // Prepare user update payload
        const userUpdateData: any = {};
        if (dto.firstName) userUpdateData.firstName = dto.firstName.trim();
        if (dto.lastName) userUpdateData.lastName = dto.lastName.trim();
        if (dto.gender) userUpdateData.gender = dto.gender;

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
        throw new ConflictException('Update conflicts with existing data');
      }
      throw error;
    }
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
