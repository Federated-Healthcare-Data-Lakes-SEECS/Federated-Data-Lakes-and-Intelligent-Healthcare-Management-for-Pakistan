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
  createdAt: Date;
}
