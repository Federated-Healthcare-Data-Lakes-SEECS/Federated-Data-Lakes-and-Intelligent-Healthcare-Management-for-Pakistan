import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import {
  RegisterLabTestDto,
  LabTestResponseDto,
} from './dto';

@Injectable()
export class LabTestService {
  constructor(private prisma: PrismaService) {}

  async registerLabTest(
    dto: RegisterLabTestDto,
    creatorId: number,
  ): Promise<LabTestResponseDto> {
    const department = await this.prisma.department.findUnique({
      where: { name: dto.departmentName },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    if (!dto.templateId) {
      throw new BadRequestException('templateId is required');
    }
    const template = await this.prisma.labTestTemplate.findFirst({
      where: { id: dto.templateId, isActive: true, deletedAt: null },
    });
    if (!template) {
      throw new NotFoundException('Lab test template not found or is inactive');
    }
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

  async getAllLabTests(): Promise<LabTestResponseDto[]> {
    const labTests = await this.prisma.labTest.findMany({
      where: { deletedAt: null },
      include: { department: true, template: true },
    });
    if (!labTests || labTests.length === 0) {
      return [];
    }
    return plainToInstance(LabTestResponseDto, labTests, {
      excludeExtraneousValues: true,
    });
  }

  async getLabTestById(id: number): Promise<LabTestResponseDto> {
    const labTest = await this.prisma.labTest.findFirst({
      where: { id, deletedAt: null },
      include: { department: true, template: true },
    });
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
      where: { departmentId: department.id, deletedAt: null },
      include: { department: true, template: true },
    });
    if (!labTests || labTests.length === 0) {
      return [];
    }
    return plainToInstance(LabTestResponseDto, labTests, {
      excludeExtraneousValues: true,
    });
  }

  async toggleLabTest(id: number): Promise<LabTestResponseDto> {
    const labTest = await this.prisma.labTest.findFirst({
      where: { id, deletedAt: null },
    });
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

  async softDeleteLabTest(id: number): Promise<{ message: string }> {
    const labTest = await this.prisma.labTest.findFirst({
      where: { id, deletedAt: null },
    });
    if (!labTest) {
      throw new NotFoundException('LabTest not found');
    }
    await this.prisma.labTest.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { message: 'Lab test deleted successfully' };
  }

  async getActiveTemplates() {
    const templates = await this.prisma.labTestTemplate.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true, version: true },
    });
    return templates;
  }
}
