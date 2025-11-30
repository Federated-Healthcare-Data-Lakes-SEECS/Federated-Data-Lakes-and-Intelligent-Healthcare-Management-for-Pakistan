import {
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export class RegisterReceptionistDto {
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

    // ---------- Receptionist Info ----------

    @IsOptional()
    @IsString()
    phoneNumber?: string;
}

export class UpdateReceptionistDto {
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

    // ---------- Receptionist Info ----------

    @IsOptional()
    @IsString()
    phoneNumber?: string;
}

import { Expose } from 'class-transformer';

export class ReceptionistResponseDto {
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
    phoneNumber?: string;

    @Expose()
    isActive: boolean;

    @Expose()
    createdAt: Date;
}

// ============================================================================
// PATIENT MANAGEMENT DTOs
// ============================================================================

export class RegisterPatientDto {
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsEnum(Gender)
    gender: Gender;

    @IsOptional()
    @IsString()
    cnic?: string;

    @IsOptional()
    @IsString()
    dateOfBirth?: string;

    @IsOptional()
    @IsString()
    bloodGroup?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    emergencyContact?: string;

    @IsOptional()
    @IsString()
    allergies?: string;

    @IsOptional()
    @IsString()
    medicalHistory?: string;

    @IsOptional()
    @IsString()
    familyHistory?: string;
}

// ============================================================================
// APPOINTMENT MANAGEMENT DTOs
// ============================================================================

export class BookWalkinAppointmentDto {
    @IsNotEmpty()
    @IsInt()
    patientId: number;

    @IsNotEmpty()
    @IsInt()
    slotId: number;

    @IsOptional()
    @IsString()
    reason?: string;
}

export class GetReceptionistAppointmentsQueryDto {
    @IsOptional()
    @IsString()
    status?: 'BOOKED' | 'COMPLETED' | 'NOT_ATTENDED' | 'all';

    @IsOptional()
    @IsString()
    timeFilter?: 'upcoming' | 'past' | 'all';

    @IsOptional()
    @IsString()
    patientSearch?: string; // Search by patient name or email
}
