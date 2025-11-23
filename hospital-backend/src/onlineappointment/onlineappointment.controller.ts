import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { OnlineAppointmentService } from './onlineappointment.service';
import { BookOnlineAppointmentDto, GetAppointmentsQueryDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.PATIENT)
@Controller('online-appointments')
export class OnlineAppointmentController {
  constructor(private onlineAppointmentService: OnlineAppointmentService) {}

  @Post('book')
  bookAppointment(
    @Body() dto: BookOnlineAppointmentDto,
    @GetUser('id') userId: number,
  ) {
    return this.onlineAppointmentService.bookAppointment(dto, userId);
  }

  @Get('my-appointments')
  getMyAppointments(
    @GetUser('id') userId: number,
    @Query() query: GetAppointmentsQueryDto,
  ) {
    return this.onlineAppointmentService.getMyAppointments(userId, query);
  }

  @Patch(':id/cancel')
  cancelAppointment(
    @Param('id') id: string,
    @GetUser('id') userId: number,
  ) {
    return this.onlineAppointmentService.cancelAppointment(parseInt(id), userId);
  }
}
