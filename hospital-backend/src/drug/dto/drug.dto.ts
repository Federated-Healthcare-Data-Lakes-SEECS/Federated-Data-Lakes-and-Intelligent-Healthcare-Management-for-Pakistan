import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class RegisterDrugDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  formulaName: string;

  @IsString()
  @IsNotEmpty()
  chemicalFormula: string;

  @IsString()
  @IsNotEmpty()
  dosageForm: string;

  @IsString()
  @IsNotEmpty()
  supplier: string;

  @IsString()
  @IsNotEmpty()
  strength: string;

  @IsBoolean()
  isActive: boolean;
}

export class UpdateDrugDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsString()
  formulaName?: string;

  @IsString()
  chemicalFormula?: string;

  @IsString()
  dosageForm?: string;

  @IsString()
  supplier?: string;

  @IsString()
  strength?: string;

  @IsBoolean()
  isActive?: boolean;
}

import { Expose } from 'class-transformer';

export class DrugResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  formulaName: string;

  @Expose()
  chemicalFormula: string;

  @Expose()
  dosageForm: string;

  @Expose()
  supplier: string;

  @Expose()
  strength: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
