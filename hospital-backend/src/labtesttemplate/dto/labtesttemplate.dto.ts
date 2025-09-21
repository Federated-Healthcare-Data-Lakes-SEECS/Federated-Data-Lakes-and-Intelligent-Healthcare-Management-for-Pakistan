import {
  IsString,
  IsOptional,
  IsBoolean,
  IsJSON,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Expose } from 'class-transformer';

export class RegisterLabTestTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsJSON()
  @IsNotEmpty()
  formStructure: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateLabTestTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsJSON()
  @IsOptional()
  formStructure?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class LabTestTemplateResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  version: string;

  @Expose()
  formStructure: any;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
