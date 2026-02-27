import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterLabTestTemplateDto, LabTestTemplateResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LabTestTemplateService {
  constructor(private prisma: PrismaService) {}

  async registerLabTestTemplate(
    dto: RegisterLabTestTemplateDto,
  ): Promise<LabTestTemplateResponseDto> {
    const existingTemplate = await this.prisma.labTestTemplate.findFirst({
      where: {
        name: dto.name,
        version: dto.version,
        deletedAt: null,
      },
    });

    if (existingTemplate) {
      throw new ConflictException(
        `A lab test template with name "${dto.name}" and version "${dto.version}" already exists. Please use a different name or version.`,
      );
    }

    try {
      const template = await this.prisma.labTestTemplate.create({
        data: {
          name: dto.name,
          description: dto.description,
          version: dto.version,
          formStructure: dto.formStructure,
          isActive: dto.isActive ?? true,
        },
      });
      return plainToInstance(LabTestTemplateResponseDto, template, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `A lab test template with name "${dto.name}" and version "${dto.version}" already exists. Please use a different name or version.`,
        );
      }
      throw error;
    }
  }

  async getLabTestTemplateById(id: number): Promise<LabTestTemplateResponseDto> {
    const template = await this.prisma.labTestTemplate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!template) {
      throw new NotFoundException('Lab test template not found');
    }
    return plainToInstance(LabTestTemplateResponseDto, template, {
      excludeExtraneousValues: true,
    });
  }

  async getAllLabTestTemplates(): Promise<LabTestTemplateResponseDto[]> {
    const templates = await this.prisma.labTestTemplate.findMany({
      where: { deletedAt: null },
    });
    if (!templates || templates.length === 0) {
      return [];
    }
    return plainToInstance(LabTestTemplateResponseDto, templates, {
      excludeExtraneousValues: true,
    });
  }

  async toggleLabTestTemplate(id: number): Promise<LabTestTemplateResponseDto> {
    const template = await this.prisma.labTestTemplate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!template) {
      throw new NotFoundException('Lab test template not found');
    }
    const updatedTemplate = await this.prisma.labTestTemplate.update({
      where: { id },
      data: { isActive: !template.isActive },
    });
    return plainToInstance(LabTestTemplateResponseDto, updatedTemplate, {
      excludeExtraneousValues: true,
    });
  }

  async softDeleteLabTestTemplate(id: number): Promise<{ message: string }> {
    const template = await this.prisma.labTestTemplate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!template) {
      throw new NotFoundException('Lab test template not found');
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.labTest.updateMany({
        where: { templateId: id, deletedAt: null },
        data: { deletedAt: new Date(), isActive: false },
      });

      await prisma.labTestTemplate.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      });
    });

    return { message: 'Lab test template and related lab tests deleted successfully' };
  }
}
