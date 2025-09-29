import { IsEmail, IsString, MinLength, IsEnum, MaxLength, Matches } from 'class-validator';
import { Gender } from '@prisma/client';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  // Password must be 8-255 chars, include upper, lower, number and special char
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,255}$/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @IsEnum(Gender)
  gender: Gender;

  // CNIC format: XXXXX-XXXXXXX-X (15 chars including dashes)
  @IsString()
  @Matches(/^\d{5}-\d{7}-\d{1}$/, {
    message: 'CNIC must be in format 12345-1234567-1',
  })
  cnic: string;
}

export class AuthResponseDto {
  access_token: string;
}