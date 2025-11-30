import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDrugDto, DrugResponseDto } from './dto';
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
        isActive: dto.isActive ?? true,
      },
    });

    return plainToInstance(DrugResponseDto, drug, {
      excludeExtraneousValues: true,
    });
  }

  async getAllDrugs(): Promise<DrugResponseDto[]> {
    const drugs = await this.prisma.drug.findMany({
      where: { deletedAt: null },
    });

    if (!drugs || drugs.length === 0) {
      return [];
    }
    return plainToInstance(DrugResponseDto, drugs, {
      excludeExtraneousValues: true,
    });
  }

  async getDrugById(id: number): Promise<DrugResponseDto> {
    const drug = await this.prisma.drug.findFirst({
      where: { id, deletedAt: null },
    });

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    return plainToInstance(DrugResponseDto, drug, {
      excludeExtraneousValues: true,
    });
  }

  async toggleDrug(id: number): Promise<DrugResponseDto> {
    const drug = await this.prisma.drug.findFirst({
      where: { id, deletedAt: null },
    });

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    const updatedDrug = await this.prisma.drug.update({
      where: { id },
      data: { isActive: !drug.isActive },
    });

    return plainToInstance(DrugResponseDto, updatedDrug, {
      excludeExtraneousValues: true,
    });
  }

  async softDeleteDrug(id: number): Promise<{ message: string }> {
    const drug = await this.prisma.drug.findFirst({
      where: { id, deletedAt: null },
    });

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    await this.prisma.drug.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Drug deleted successfully' };
  }
}
