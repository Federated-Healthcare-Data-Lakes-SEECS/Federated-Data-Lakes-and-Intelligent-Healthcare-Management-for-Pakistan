import { IsString, IsOptional, IsDateString, Matches } from 'class-validator';

export class UpdatePatientProfileDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-\d{7}-\d{1}$/, {
    message: 'CNIC must be in format 12345-1234567-1',
  })
  cnic?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @IsOptional()
  @IsString()
  familyHistory?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;
}
