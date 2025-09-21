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
    createdAt: Date;
}
