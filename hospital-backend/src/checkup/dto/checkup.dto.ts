import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class MedicationDto {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  drugId: number;

  @IsString()
  @IsNotEmpty()
  dosePerIntake: string;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  timesPerDay: number;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  totalDays: number;

  @IsString()
  @IsOptional()
  instructions?: string;
}

export class CreateCheckupDto {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
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
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  medications: MedicationDto[];

  @IsString()
  @IsOptional()
  additionalMedications?: string;

  // Lab Test Recommendations
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((v: unknown) => typeof v === 'string' ? parseInt(v as string, 10) : v) : parsed;
    }
    return value;
  })
  recommendedLabTestIds: number[];

  @IsString()
  @IsOptional()
  additionalTests?: string;

  // Draft mode - if true, saves as draft without completing appointment
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}

export class SaveDraftDto {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
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
  @IsOptional()
  symptoms?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @IsOptional()
  medications?: MedicationDto[];

  @IsString()
  @IsOptional()
  additionalMedications?: string;

  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((v: unknown) => typeof v === 'string' ? parseInt(v as string, 10) : v) : parsed;
    }
    return value;
  })
  @IsOptional()
  recommendedLabTestIds?: number[];

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
  gender: string;
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

// Audio state for UI display
export interface AudioInfoResponseDto {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transcription?: string;
  extractedInfo?: Record<string, any>; // JSON object with structured clinical data
  processedAt?: Date;
  errorMessage?: string;
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
  insights?: string; // AI-generated insights (legacy)
  gapAnalysis?: string; // Gap analysis from AI - additional details found in conversation
  isDraft: boolean;
  prescription: PrescriptionResponseDto;
  checkupTestRecommendation: CheckupTestRecommendationResponseDto;
  appointment: AppointmentResponseDto;
  hasAudio?: boolean; // Indicates if audio was recorded
  audioInfo?: AudioInfoResponseDto; // Detailed audio processing info
  createdAt: Date;
  updatedAt: Date;
}
