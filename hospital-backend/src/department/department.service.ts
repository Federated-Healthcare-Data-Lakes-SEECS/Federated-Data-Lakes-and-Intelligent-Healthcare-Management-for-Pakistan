import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
      standardDepartmentId = standardDepartment.id;
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
