import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';

import {
  RegisterLabTechnicianDto,
  UpdateLabTechnicianDto,
  LabTechnicianResponseDto,
} from './dto';

interface LabTechnicianInterface {
  id: number;
  userId: number;
  departmentId: number;
  specialization: string;
  qualification: string;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    cnic: string;
    isActive: boolean;
    createdAt: Date;
  };
  department: {
    id: number;
    name: string;
  };
}

@Injectable()
export class LabTechnicianService {
  constructor(private prisma: PrismaService) {}

  async registerLabTechnician(dto: RegisterLabTechnicianDto): Promise<LabTechnicianResponseDto> {
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

    // 3. Check for existing user with same CNIC
    if (dto.cnic) {
      const existingUserByCnic = await this.prisma.user.findFirst({
        where: { cnic: dto.cnic },
      });
      if (existingUserByCnic) {
        throw new ConflictException(
          `User with this CNIC already exists`,
        );
      }
    }

    // 4. Get default password and hash it
    const password = process.env.DEFAULT_PASSWORD as string;
    if (!password) {
      throw new BadRequestException('Default password not configured');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // 5. Use transaction to ensure data consistency
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

        // Create Lab Technician
        const labTechnician = await prisma.labTechnician.create({
          data: {
            userId: user.id,
            departmentId: department.id,
            specialization: dto.specialization || '',
            experience: dto.experience || 0,
            qualification: dto.qualification || '',
          },
          include: {
            user: true,
            department: true,
          },
        });

        const role = await prisma.role.findUnique({
          where: { name: 'LAB_TECHNICIAN' },
        });

        if (!role) {
          throw new NotFoundException('Role "LAB_TECHNICIAN" not found');
        }

        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });

        return labTechnician;
      });

      // 6. Transform and return response
      return this.transformToLabTechnicianResponse(result as LabTechnicianInterface);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A lab technician with these credentials already exists',
        );
      }
      throw error;
    }
  }

  async updateLabTechnician(
    id: number,
    dto: UpdateLabTechnicianDto,
  ): Promise<LabTechnicianResponseDto> {
    // Validate lab technician exists
    const existingLabTechnician = await this.prisma.labTechnician.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!existingLabTechnician) {
      throw new NotFoundException(`Lab Technician with ID ${id} not found`);
    }

    let departmentId = existingLabTechnician.departmentId;

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

    // Update using transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update User
      if (dto.firstName || dto.lastName || dto.gender) {
        await prisma.user.update({
          where: { id: existingLabTechnician.userId },
          data: {
            ...(dto.firstName && { firstName: dto.firstName }),
            ...(dto.lastName && { lastName: dto.lastName }),
            ...(dto.gender && { gender: dto.gender }),
          },
        });
      }

      // Update Lab Technician
      const labTechnician = await prisma.labTechnician.update({
        where: { id },
        data: {
          ...(dto.specialization !== undefined && { specialization: dto.specialization }),
          ...(dto.experience !== undefined && { experience: dto.experience }),
          ...(dto.qualification !== undefined && { qualification: dto.qualification }),
          ...(departmentId !== existingLabTechnician.departmentId && { departmentId }),
        },
        include: {
          user: true,
          department: true,
        },
      });

      return labTechnician;
    });

    return this.transformToLabTechnicianResponse(result as LabTechnicianInterface);
  }

  async activateLabTechnician(id: number): Promise<LabTechnicianResponseDto> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!labTechnician) {
      throw new NotFoundException(`Lab Technician with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id: labTechnician.userId },
      data: { isActive: true },
    });

    const updated = await this.prisma.labTechnician.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    return this.transformToLabTechnicianResponse(updated as LabTechnicianInterface);
  }

  async deactivateLabTechnician(id: number): Promise<LabTechnicianResponseDto> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!labTechnician) {
      throw new NotFoundException(`Lab Technician with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id: labTechnician.userId },
      data: { isActive: false },
    });

    const updated = await this.prisma.labTechnician.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    return this.transformToLabTechnicianResponse(updated as LabTechnicianInterface);
  }

  async getAllLabTechnicians(): Promise<LabTechnicianResponseDto[]> {
    const labTechnicians = await this.prisma.labTechnician.findMany({
      include: {
        user: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return labTechnicians.map((lt) =>
      this.transformToLabTechnicianResponse(lt as LabTechnicianInterface),
    );
  }

  async getLabTechnicianById(id: number): Promise<LabTechnicianResponseDto> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
      },
    });

    if (!labTechnician) {
      throw new NotFoundException(`Lab Technician with ID ${id} not found`);
    }

    return this.transformToLabTechnicianResponse(labTechnician as LabTechnicianInterface);
  }

  async deleteLabTechnician(id: number): Promise<{ message: string }> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!labTechnician) {
      throw new NotFoundException(`Lab Technician with ID ${id} not found`);
    }

    // Delete user (cascades to lab technician and user roles)
    await this.prisma.user.delete({
      where: { id: labTechnician.userId },
    });

    return { message: `Lab Technician with ID ${id} deleted successfully` };
  }

  async getLabTechniciansByDepartment(departmentName: string): Promise<LabTechnicianResponseDto[]> {
    const department = await this.prisma.department.findUnique({
      where: { name: departmentName },
    });

    if (!department) {
      throw new NotFoundException(`Department '${departmentName}' not found`);
    }

    const labTechnicians = await this.prisma.labTechnician.findMany({
      where: { departmentId: department.id },
      include: {
        user: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return labTechnicians.map((lt) =>
      this.transformToLabTechnicianResponse(lt as LabTechnicianInterface),
    );
  }

  private transformToLabTechnicianResponse(
    labTechnician: LabTechnicianInterface,
  ): LabTechnicianResponseDto {
    return plainToInstance(
      LabTechnicianResponseDto,
      {
        id: labTechnician.id,
        firstName: labTechnician.user.firstName,
        lastName: labTechnician.user.lastName,
        email: labTechnician.user.email,
        gender: labTechnician.user.gender,
        cnic: labTechnician.user.cnic,
        specialization: labTechnician.specialization,
        qualification: labTechnician.qualification,
        experience: labTechnician.experience,
        departmentName: labTechnician.department.name,
        isActive: labTechnician.user.isActive,
        createdAt: labTechnician.createdAt,
      },
      { excludeExtraneousValues: true },
    );
  }
}
