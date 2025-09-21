import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterLabTestTemplateDto, UpdateLabTestTemplateDto, LabTestTemplateResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class LabTestTemplateService {
    constructor(private prisma: PrismaService) { }

    async registerLabTestTemplate(
        dto: RegisterLabTestTemplateDto,
    ): Promise<LabTestTemplateResponseDto> {
        try {
            const template = await this.prisma.labTestTemplate.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    version: dto.version,
                    formStructure: dto.formStructure,
                    isActive: dto.isActive,
                },
            });
            return plainToInstance(LabTestTemplateResponseDto, template, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error('A lab test template with this name already exists.');
                }
            }
            throw error;
        }
    }

    async updateLabTestTemplate(id: number, dto: UpdateLabTestTemplateDto): Promise<LabTestTemplateResponseDto> {
        const template = await this.prisma.labTestTemplate.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                version: dto.version,
                formStructure: dto.formStructure,
                isActive: dto.isActive,
            },
        });
        return plainToInstance(LabTestTemplateResponseDto, template, {
            excludeExtraneousValues: true,
        });
    }

    async getLabTestTemplateById(id: number): Promise<LabTestTemplateResponseDto> {
        const template = await this.prisma.labTestTemplate.findUnique({ where: { id } });
        if (!template) {
            throw new NotFoundException('Lab test template not found');
        }
        return plainToInstance(LabTestTemplateResponseDto, template, {
            excludeExtraneousValues: true,
        });
    }

    async getAllLabTestTemplates(): Promise<LabTestTemplateResponseDto[]> {
        const templates = await this.prisma.labTestTemplate.findMany();
        if (!templates) {
            throw new NotFoundException('No lab test templates found');
        }
        if (templates.length === 0) {
            return [];
        }
        return plainToInstance(LabTestTemplateResponseDto, templates, {
            excludeExtraneousValues: true,
        });
    }

    async toggleLabTestTemplate(id: number): Promise<LabTestTemplateResponseDto> {
        const template = await this.prisma.labTestTemplate.findUnique({ where: { id } });
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
}
