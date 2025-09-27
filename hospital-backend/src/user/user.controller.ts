import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { UserService } from './user.service';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Put('me/patient-profile')
  updatePatientProfile(
    @GetUser('id') userId: number,
    @Body() dto: UpdatePatientProfileDto
  ) {
    return this.userService.updatePatientProfile(userId, dto);
  }
}