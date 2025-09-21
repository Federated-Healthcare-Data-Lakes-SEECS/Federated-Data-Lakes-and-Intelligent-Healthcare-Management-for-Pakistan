import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
    // return 'Registration endpoint is currently disabled for testing purposes.';
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
    // return 'Login endpoint is currently disabled for testing purposes.';

  }
}