import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import {
  RegisterLabTestDto,
  UpdateLabTestDto,
  LabTestResponseDto,
} from './dto';

@Injectable()
export class LabTestService {
  constructor(private prisma: PrismaService) {}

  async registerLabTest(
    dto: RegisterLabTestDto,
    creatorId: number,
  ): Promise<LabTestResponseDto> {
    // Check department exists
    const department = await this.prisma.department.findUnique({
      where: { name: dto.departmentName },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    // Check template exists
    if (!dto.templateId) {
      throw new BadRequestException('templateId is required');
    }
    const template = await this.prisma.labTestTemplate.findUnique({
      where: { id: dto.templateId },
    });
    if (!template) {
      throw new NotFoundException('Lab test template not found');
    }
    // Create lab test
    const labTest = await this.prisma.labTest.create({
      data: {
        name: dto.name,
        description: dto.description,
        departmentId: department.id,
        templateId: dto.templateId,
      },
      include: { department: true, template: true },
    });
    return plainToInstance(LabTestResponseDto, labTest, {
      excludeExtraneousValues: true,
    });
  }

  async updateLabTest(
    id: number,
    dto: UpdateLabTestDto,
  ): Promise<LabTestResponseDto> {
    const labTest = await this.prisma.labTest.findUnique({ where: { id } });
    if (!labTest) {
      throw new NotFoundException('LabTest not found');
    }
    // If updating templateId, check existence
    if (dto.templateId) {
      const template = await this.prisma.labTestTemplate.findUnique({
        where: { id: dto.templateId },
      });
      if (!template) {
        throw new NotFoundException('Lab test template not found');
      }
    }
    const updatedLabTest = await this.prisma.labTest.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        templateId: dto.templateId,
      },
      include: { department: true, template: true },
    });
    return plainToInstance(LabTestResponseDto, updatedLabTest, {
      excludeExtraneousValues: true,
    });
  }

  async getAllLabTests(): Promise<LabTestResponseDto[]> {
    const labTests = await this.prisma.labTest.findMany({
      include: { department: true, template: true },
    });
    if (!labTests || labTests.length === 0) {
      throw new NotFoundException('No lab tests found');
    }
    return plainToInstance(LabTestResponseDto, labTests, {
      excludeExtraneousValues: true,
    });
  }

  async getLabTestById(id: number): Promise<LabTestResponseDto> {
    const labTest = await this.prisma.labTest.findUnique({ where: { id }, include: { department: true, template: true } });
    if (!labTest) {
      throw new NotFoundException('LabTest not found');
    }
    return plainToInstance(LabTestResponseDto, labTest, {
      excludeExtraneousValues: true,
    });
  }

  async getLabTestsByDepartment(departmentName: string): Promise<LabTestResponseDto[]> {
    const department = await this.prisma.department.findUnique({
      where: { name: departmentName },
    });
    if (!department) {
      throw new NotFoundException(`Department '${departmentName}' not found`);
    }
    const labTests = await this.prisma.labTest.findMany({
      where: { departmentId: department.id },
      include: { department: true, template: true },
    });
    if (!labTests || labTests.length === 0) {
      throw new NotFoundException('No lab tests found for this department');
    }
    return plainToInstance(LabTestResponseDto, labTests, {
      excludeExtraneousValues: true,
    });
  }

  async toggleLabTest(id: number): Promise<LabTestResponseDto> {
    const labTest = await this.prisma.labTest.findUnique({ where: { id } });
    if (!labTest) {
      throw new NotFoundException('LabTest not found');
    }
    const updatedLabTest = await this.prisma.labTest.update({
      where: { id },
      data: { isActive: !labTest.isActive },
      include: { department: true, template: true },
    });

    return plainToInstance(LabTestResponseDto, updatedLabTest, {
      excludeExtraneousValues: true,
    });
  }
}
