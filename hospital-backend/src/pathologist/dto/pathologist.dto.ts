import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Expose } from 'class-transformer';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class RegisterPathologistDto {
  // ---------- User Info ----------
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  cnic: string;

  // ---------- Pathologist Info ----------
  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experience?: number;

  @IsString()
  @IsNotEmpty()
  qualification: string;

  // ---------- Department Info ----------
  @IsString()
  @IsNotEmpty()
  departmentName: string;
}

export class UpdatePathologistDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  // ---------- Pathologist Info ----------
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experience?: number;

  @IsOptional()
  @IsString()
  qualification?: string;

  // ---------- Department Info ----------
  @IsOptional()
  @IsString()
  departmentName?: string;
}

export class PathologistResponseDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  gender: string;

  @Expose()
  cnic: string;

  @Expose()
  specialization: string;

  @Expose()
  qualification: string;

  @Expose()
  experience: number;

  @Expose()
  departmentName: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
}
