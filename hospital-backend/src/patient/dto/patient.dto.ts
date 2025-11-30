import { IsString, IsEmail, IsEnum } from 'class-validator';
import { Gender } from '@prisma/client';

export class RegisterPatientDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  cnic: string;
}

import { Expose } from 'class-transformer';

export class PatientResponseDto {
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
  isActive: boolean;

  @Expose()
  dateOfBirth: Date | null;

  @Expose()
  bloodGroup: string | null;

  @Expose()
  medicalHistory: string | null;

  @Expose()
  familyHistory: string | null;

  @Expose()
  allergies: string | null;

  @Expose()
  address: string | null;

  @Expose()
  phoneNumber: string | null;

  @Expose()
  emergencyContact: string | null;

  @Expose()
  onboardingDone: boolean;

  @Expose()
  createdAt: Date;
}
