import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCheckupDto {
  @IsNumber()
  appointmentId: number;

  @IsString()
  @IsOptional()
  bloodPressure: string;

  @IsString()
  @IsOptional()
  temperature: string;

  @IsString()
  @IsOptional()
  heartRate: string;

  @IsString()
  @IsOptional()
  bloodSugar: string;

  @IsString()
  @IsNotEmpty()
  symptoms: string;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  additionalMedications: string;

  @IsString()
  @IsOptional()
  additionalTests: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestDto)
  recommendedTests: TestDto[];
}

export class MedicationDto {
  @IsNumber()
  drugId: number;

  @IsNumber()
  quantity: number;

  @IsString()
  dosage: string;

  @IsNumber()
  dailyFrequency: number;

  @IsNumber()
  durationDays: number;

  @IsString()
  guidelines: string;
}

export class TestDto {
  @IsNumber()
  testId: number;
}
