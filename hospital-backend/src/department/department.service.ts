import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
  StandardDepartmentDto,
} from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async registerDepartment(
    dto: RegisterDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const standardDepartment = await this.prisma.standardDepartment.findFirst({
      where: { code: dto.code },
    });

    if (!standardDepartment) {
      throw new BadRequestException('Invalid department code');
    }

    // Check if a department with this standard department already exists
    const existingDepartment = await this.prisma.department.findFirst({
      where: { standardDepartmentId: standardDepartment.id },
    });

    if (existingDepartment) {
      throw new ConflictException(
        `A department already exists for standard department "${standardDepartment.name}" (Code: ${dto.code}). Each standard department can only be assigned once.`,
      );
    }

    // Check if department name already exists
    const existingName = await this.prisma.department.findFirst({
      where: { name: dto.name },
    });

    if (existingName) {
      throw new ConflictException(
        `A department with the name "${dto.name}" already exists. Please choose a different name.`,
      );
    }

    const department = await this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        standardDepartmentId: standardDepartment.id,
      },
      include: {
        standardDepartment: true,
      },
    });

    return plainToInstance(DepartmentResponseDto, department, {
      excludeExtraneousValues: true,
    });
  }

  async updateDepartment(
    id: number,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        standardDepartment: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    let standardDepartmentId = department.standardDepartmentId;
    if (dto.code) {
      const standardDepartment = await this.prisma.standardDepartment.findFirst(
        {
          where: { code: dto.code },
        },
      );
      if (!standardDepartment) {
        throw new BadRequestException('Invalid department code');
      }

      // Check if another department already uses this standard department
      if (standardDepartment.id !== department.standardDepartmentId) {
        const existingDepartment = await this.prisma.department.findFirst({
          where: { 
            standardDepartmentId: standardDepartment.id,
            id: { not: id },
          },
        });

        if (existingDepartment) {
          throw new ConflictException(
            `Standard department "${standardDepartment.name}" (Code: ${dto.code}) is already assigned to another department "${existingDepartment.name}". Each standard department can only be assigned once.`,
          );
        }
      }

      standardDepartmentId = standardDepartment.id;
    }

    // Check if the new name conflicts with another department
    if (dto.name && dto.name !== department.name) {
      const existingName = await this.prisma.department.findFirst({
        where: { 
          name: dto.name,
          id: { not: id },
        },
      });

      if (existingName) {
        throw new ConflictException(
          `A department with the name "${dto.name}" already exists. Please choose a different name.`,
        );
      }
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name ?? department.name,
        description: dto.description ?? department.description,
        standardDepartmentId,
      },
      include: {
        standardDepartment: true,
      },
    });

    return plainToInstance(DepartmentResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async getAllDepartments(): Promise<DepartmentResponseDto[]> {
    const departments = await this.prisma.department.findMany({
      include: {
        standardDepartment: true,
      },
    });

    return plainToInstance(DepartmentResponseDto, departments, {
      excludeExtraneousValues: true,
    });
  }

  async getStandardDepartments() {
    const standardDepartments = await this.prisma.standardDepartment.findMany();

    return plainToInstance(StandardDepartmentDto, standardDepartments, {
      excludeExtraneousValues: true,
    });
  }
}
