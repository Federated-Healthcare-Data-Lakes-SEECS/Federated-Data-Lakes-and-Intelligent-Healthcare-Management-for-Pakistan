import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { CheckupService } from './checkup.service';
import { CreateCheckupDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
@Controller('checkups')
export class CheckupController {
  constructor(private checkupService: CheckupService) {}

  @Post()
  createCheckup(
    @Body() dto: CreateCheckupDto,
    @GetUser('id') userId: number,
  ) {
    return this.checkupService.createCheckup(dto, userId);
  }

  @Get('history')
  getCheckupHistory(@GetUser('id') userId: number) {
    return this.checkupService.getCheckupHistory(userId);
  }

  @Get(':id')
  getCheckupById(@Param('id') id: string, @GetUser('id') userId: number) {
    return this.checkupService.getCheckupById(parseInt(id), userId);
  }
}
