import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class RegisterLabTestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  departmentName: string;

  @IsNumber()
  @IsNotEmpty()
  templateId: number;
}

export class UpdateLabTestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  templateId?: number;
}

import { Expose, Transform } from 'class-transformer';

export class LabTestResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Transform(({ obj }: { obj: { department?: { name?: string } } }) => obj.department?.name ?? '')
  @Expose()
  departmentName: string;

  @Transform(({ obj }: { obj: { template?: { name?: string } } }) => obj.template?.name ?? '')
  @Expose()
  templateName: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
