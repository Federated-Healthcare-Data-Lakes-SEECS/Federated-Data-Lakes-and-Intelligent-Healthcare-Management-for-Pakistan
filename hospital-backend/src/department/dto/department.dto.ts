import { IsString, IsOptional } from 'class-validator';

export class RegisterDepartmentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  code: string;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  code?: string;
}

import { Expose, Transform } from 'class-transformer';

export class DepartmentResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.standardDepartment?.code)
  code: string;
}

export class StandardDepartmentDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: string;
}

