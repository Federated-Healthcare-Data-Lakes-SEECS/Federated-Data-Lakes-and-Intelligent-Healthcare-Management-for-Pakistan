import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
    MinLength,
} from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class RegisterDoctorDto {
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

  // ---------- Doctor Info ----------
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

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
  @IsString()
  @IsNotEmpty()
  departmentName: string;
}

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  cnic?: string;

  // ---------- Doctor Info ----------
  @IsOptional()
  @IsString()
  licenseNumber?: string;

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

import { Expose } from 'class-transformer';

export class DoctorResponseDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  gender: Gender;

  @Expose()
  cnic: string;

  @Expose()
  licenseNumber: string;

  @Expose()
  specialization?: string;

  @Expose()
  experience?: number;

  @Expose()
  qualification?: string;

  @Expose()
  departmentName: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
}
