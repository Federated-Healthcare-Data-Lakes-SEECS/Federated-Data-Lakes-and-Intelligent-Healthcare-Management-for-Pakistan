import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MedicationDto {
  @IsInt()
  @IsNotEmpty()
  drugId: number;

  @IsString()
  @IsNotEmpty()
  dosePerIntake: string;

  @IsInt()
  @IsNotEmpty()
  timesPerDay: number;

  @IsInt()
  @IsNotEmpty()
  totalDays: number;

  @IsString()
  @IsOptional()
  instructions?: string;
}

export class CreateCheckupDto {
  @IsInt()
  @IsNotEmpty()
  appointmentId: number;

  @IsString()
  @IsOptional()
  bloodPressure?: string;

  @IsString()
  @IsOptional()
  temperature?: string;

  @IsString()
  @IsOptional()
  heartRate?: string;

  @IsString()
  @IsOptional()
  bloodSugar?: string;

  @IsString()
  @IsNotEmpty()
  symptoms: string;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Prescription
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  @IsString()
  @IsOptional()
  additionalMedications?: string;

  // Lab Test Recommendations
  @IsArray()
  @IsInt({ each: true })
  recommendedLabTestIds: number[];

  @IsString()
  @IsOptional()
  additionalTests?: string;
}

export class DrugResponseDto {
  id: number;
  name: string;
  strength: string;
  dosageForm: string;
  formulaName: string;
}

export class MedicationResponseDto {
  id: number;
  drug: DrugResponseDto;
  dosePerIntake: string;
  timesPerDay: number;
  totalDays: number;
  instructions?: string;
}

export class PrescriptionResponseDto {
  id: number;
  additionalMedications?: string;
  medications: MedicationResponseDto[];
}

export class LabTestResponseDto {
  id: number;
  name: string;
}

export class RecommendedLabTestResponseDto {
  id: number;
  labTest: LabTestResponseDto;
}

export class CheckupTestRecommendationResponseDto {
  id: number;
  additionalTests?: string;
  recommendedLabTests: RecommendedLabTestResponseDto[];
}

export class AppointmentSlotResponseDto {
  startTime: Date;
  endTime: Date;
}

export class PatientResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  bloodGroup: string;
  medicalHistory?: string;
  allergies?: string;
}

export class AppointmentResponseDto {
  id: number;
  patientId: number;
  slotId: number;
  reason?: string;
  createdAt: Date;
  slot: AppointmentSlotResponseDto;
  patient: PatientResponseDto;
}

export class CheckupResponseDto {
  id: number;
  appointmentId: number;
  bloodPressure?: string;
  temperature?: string;
  heartRate?: string;
  bloodSugar?: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  prescription: PrescriptionResponseDto;
  checkupTestRecommendation: CheckupTestRecommendationResponseDto;
  appointment: AppointmentResponseDto;
  createdAt: Date;
  updatedAt: Date;
}
