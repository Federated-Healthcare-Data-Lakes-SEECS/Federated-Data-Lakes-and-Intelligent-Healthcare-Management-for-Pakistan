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
  RegisterPathologistDto,
  UpdatePathologistDto,
  PathologistResponseDto,
} from './dto';

interface PathologistInterface {
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
export class PathologistService {
  constructor(private prisma: PrismaService) {}

  async registerPathologist(dto: RegisterPathologistDto): Promise<PathologistResponseDto> {
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

        // Create Pathologist
        const pathologist = await prisma.pathologist.create({
          data: {
            userId: user.id,
            departmentId: department.id,
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
          where: { name: 'PATHOLOGIST' },
        });

        if (!role) {
          throw new NotFoundException('Role "PATHOLOGIST" not found');
        }

        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });

        return pathologist;
      });

      // 6. Transform and return response
      return this.transformToPathologistResponse(result as PathologistInterface);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A pathologist with these credentials already exists',
        );
      }
      throw error;
    }
  }

  async updatePathologist(
    id: number,
    dto: UpdatePathologistDto,
  ): Promise<PathologistResponseDto> {
    // Validate pathologist exists
    const existingPathologist = await this.prisma.pathologist.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!existingPathologist) {
      throw new NotFoundException(`Pathologist with ID ${id} not found`);
    }

    let departmentId = existingPathologist.departmentId;

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
          where: { id: existingPathologist.userId },
          data: {
            ...(dto.firstName && { firstName: dto.firstName }),
            ...(dto.lastName && { lastName: dto.lastName }),
            ...(dto.gender && { gender: dto.gender }),
          },
        });
      }

      // Update Pathologist
      const pathologist = await prisma.pathologist.update({
        where: { id },
        data: {
          ...(dto.specialization !== undefined && { specialization: dto.specialization }),
          ...(dto.experience !== undefined && { experience: dto.experience }),
          ...(dto.qualification !== undefined && { qualification: dto.qualification }),
          ...(departmentId !== existingPathologist.departmentId && { departmentId }),
        },
        include: {
          user: true,
          department: true,
        },
      });

      return pathologist;
    });

    return this.transformToPathologistResponse(result as PathologistInterface);
  }

  async activatePathologist(id: number): Promise<PathologistResponseDto> {
    const pathologist = await this.prisma.pathologist.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!pathologist) {
      throw new NotFoundException(`Pathologist with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id: pathologist.userId },
      data: { isActive: true },
    });

    const updated = await this.prisma.pathologist.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    return this.transformToPathologistResponse(updated as PathologistInterface);
  }

  async deactivatePathologist(id: number): Promise<PathologistResponseDto> {
    const pathologist = await this.prisma.pathologist.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!pathologist) {
      throw new NotFoundException(`Pathologist with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id: pathologist.userId },
      data: { isActive: false },
    });

    const updated = await this.prisma.pathologist.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    return this.transformToPathologistResponse(updated as PathologistInterface);
  }

  async getAllPathologists(): Promise<PathologistResponseDto[]> {
    const pathologists = await this.prisma.pathologist.findMany({
      include: {
        user: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pathologists.map((p) =>
      this.transformToPathologistResponse(p as PathologistInterface),
    );
  }

  async getPathologistById(id: number): Promise<PathologistResponseDto> {
    const pathologist = await this.prisma.pathologist.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
      },
    });

    if (!pathologist) {
      throw new NotFoundException(`Pathologist with ID ${id} not found`);
    }

    return this.transformToPathologistResponse(pathologist as PathologistInterface);
  }

  async deletePathologist(id: number): Promise<{ message: string }> {
    const pathologist = await this.prisma.pathologist.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!pathologist) {
      throw new NotFoundException(`Pathologist with ID ${id} not found`);
    }

    // Delete user (cascades to pathologist and user roles)
    await this.prisma.user.delete({
      where: { id: pathologist.userId },
    });

    return { message: `Pathologist with ID ${id} deleted successfully` };
  }

  async getPathologistsByDepartment(departmentName: string): Promise<PathologistResponseDto[]> {
    const department = await this.prisma.department.findUnique({
      where: { name: departmentName },
    });

    if (!department) {
      throw new NotFoundException(`Department '${departmentName}' not found`);
    }

    const pathologists = await this.prisma.pathologist.findMany({
      where: { departmentId: department.id },
      include: {
        user: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pathologists.map((p) =>
      this.transformToPathologistResponse(p as PathologistInterface),
    );
  }

  private transformToPathologistResponse(
    pathologist: PathologistInterface,
  ): PathologistResponseDto {
    return plainToInstance(
      PathologistResponseDto,
      {
        id: pathologist.id,
        firstName: pathologist.user.firstName,
        lastName: pathologist.user.lastName,
        email: pathologist.user.email,
        gender: pathologist.user.gender,
        cnic: pathologist.user.cnic,
        specialization: pathologist.specialization,
        qualification: pathologist.qualification,
        experience: pathologist.experience,
        departmentName: pathologist.department.name,
        isActive: pathologist.user.isActive,
        createdAt: pathologist.createdAt,
      },
      { excludeExtraneousValues: true },
    );
  }
}
