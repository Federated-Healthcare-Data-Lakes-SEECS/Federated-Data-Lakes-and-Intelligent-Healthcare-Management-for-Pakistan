import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { Gender } from '@prisma/client';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  cnic: string;
}

export class AuthResponseDto {
  access_token: string;
}