import { IsNumber, IsNotEmpty, IsOptional, IsString, IsObject, IsEnum } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';

// ============================================================================
// REQUEST DTOs
// ============================================================================

export class OrderLabTestDto {
  @IsNumber()
  @IsNotEmpty()
  labTestId: number;
}

export class UpdateLabTestStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['SAMPLE_COLLECTED', 'PERFORMED', 'RESULTS_ADDED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])
  status: string;
}

export class SubmitLabTestResultsDto {
  @IsObject()
  @IsNotEmpty()
  result: Record<string, any>;

  @IsString()
  @IsOptional()
  labTechnicianNotes?: string;

  @IsNumber()
  @IsNotEmpty()
  pathologistId: number;
}

export class ReviewLabTestDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  pathologistNotes?: string;
}

export class LookupLabTestDto {
  @IsNumber()
  @IsNotEmpty()
  patientLabTestId: number;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

class PatientInfoDto {
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
  phoneNumber: string;
}

class LabTestInfoDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  departmentName: string;

  @Expose()
  templateId: number;

  @Expose()
  templateName: string;

  @Expose()
  formStructure: any;
}

class LabTechnicianInfoDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  specialization: string;

  @Expose()
  departmentName: string;
}

class PathologistInfoDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  specialization: string;

  @Expose()
  departmentName: string;
}

export class PatientLabTestResponseDto {
  @Expose()
  id: number;

  @Expose()
  status: string;

  @Expose()
  result: any;

  @Expose()
  labTechnicianNotes: string | null;

  @Expose()
  pathologistNotes: string | null;

  @Expose()
  orderedAt: Date;

  @Expose()
  sampleCollectedAt: Date | null;

  @Expose()
  performedAt: Date | null;

  @Expose()
  resultsAddedAt: Date | null;

  @Expose()
  reviewedAt: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => PatientInfoDto)
  patient: PatientInfoDto;

  @Expose()
  @Type(() => LabTestInfoDto)
  labTest: LabTestInfoDto;

  @Expose()
  @Type(() => LabTechnicianInfoDto)
  labTechnician: LabTechnicianInfoDto | null;

  @Expose()
  @Type(() => PathologistInfoDto)
  pathologist: PathologistInfoDto | null;
}

export class OrderLabTestResponseDto {
  @Expose()
  id: number;

  @Expose()
  labTestName: string;

  @Expose()
  departmentName: string;

  @Expose()
  status: string;

  @Expose()
  orderedAt: Date;

  @Expose()
  labTechnicianName: string;

  @Expose()
  message: string;
}

export class PatientLabTestSummaryDto {
  @Expose()
  id: number;

  @Expose()
  labTestName: string;

  @Expose()
  departmentName: string;

  @Expose()
  status: string;

  @Expose()
  orderedAt: Date;

  @Expose()
  sampleCollectedAt: Date | null;

  @Expose()
  performedAt: Date | null;

  @Expose()
  resultsAddedAt: Date | null;

  @Expose()
  reviewedAt: Date | null;

  @Expose()
  labTechnicianName: string | null;
}

export class PathologistListDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  specialization: string;

  @Expose()
  departmentName: string;
}
