import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDrugDto, UpdateDrugDto, DrugResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DrugService {
  constructor(private prisma: PrismaService) {}

  async registerDrug(
    dto: RegisterDrugDto,
    creatorId: number,
  ): Promise<DrugResponseDto> {
    const drug = await this.prisma.drug.create({
      data: {
        name: dto.name,
        description: dto.description,
        formulaName: dto.formulaName,
        chemicalFormula: dto.chemicalFormula,
        dosageForm: dto.dosageForm,
        supplier: dto.supplier,
        strength: dto.strength,
        isActive: dto.isActive,
        createdBy: creatorId,
      },
    });

    return plainToInstance(DrugResponseDto, drug, {
      excludeExtraneousValues: true,
    });
  }

  async updateDrug(id: number, dto: UpdateDrugDto): Promise<DrugResponseDto> {
    const drug = await this.prisma.drug.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        formulaName: dto.formulaName,
        chemicalFormula: dto.chemicalFormula,
        dosageForm: dto.dosageForm,
        supplier: dto.supplier,
        strength: dto.strength,
        isActive: dto.isActive,
      },
    });

    return plainToInstance(DrugResponseDto, drug, {
      excludeExtraneousValues: true,
    });
  }

  async getAllDrugs(): Promise<DrugResponseDto[]> {
    const drugs = await this.prisma.drug.findMany();

    if (!drugs) {
      throw new NotFoundException('No drugs found');
    }
    if (drugs.length === 0) {
      return [];
    }
    return plainToInstance(DrugResponseDto, drugs, {
      excludeExtraneousValues: true,
    });
  }

  async deactivateDrug(id: number): Promise<DrugResponseDto> {
    const drug = await this.prisma.drug.findUnique({ where: { id } });

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    const updatedDrug = await this.prisma.drug.update({
      where: { id },
      data: { isActive: false },
    });

    return plainToInstance(DrugResponseDto, updatedDrug, {
      excludeExtraneousValues: true,
    });
  }
}
