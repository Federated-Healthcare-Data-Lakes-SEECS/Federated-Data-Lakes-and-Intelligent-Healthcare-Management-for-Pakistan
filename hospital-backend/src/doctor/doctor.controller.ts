import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { DoctorService } from './doctor.service';
import { RegisterDoctorDto, UpdateDoctorDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('doctors')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  // Admin-only routes
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('register')
  registerDoctor(@Body() dto: RegisterDoctorDto) {
    return this.doctorService.registerDoctor(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  updateDoctor(@Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.updateDoctor(parseInt(id), dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/activate')
  activateDoctor(@Param('id') id: string) {
    return this.doctorService.activateDoctor(parseInt(id));
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/deactivate')
  deactivateDoctor(@Param('id') id: string) {
    return this.doctorService.deactivateDoctor(parseInt(id));
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAllDoctors() {
    return this.doctorService.getAllDoctors();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteDoctor(@Param('id') id: string) {
    return this.doctorService.deleteDoctor(parseInt(id));
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('department/:departmentName')
  getDoctorsByDepartment(@Param('departmentName') departmentName: string) {
    return this.doctorService.getDoctorsByDepartment(departmentName);
  }

  // Doctor-only routes
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('dashboard/stats')
  getDashboardStats(@GetUser('id') userId: number) {
    return this.doctorService.getDashboardStats(userId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('dashboard/upcoming-appointments')
  getUpcomingAppointments(
    @GetUser('id') userId: number,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.doctorService.getUpcomingAppointments(userId, limitNum);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('dashboard/recent-checkups')
  getRecentCheckups(
    @GetUser('id') userId: number,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.doctorService.getRecentCheckups(userId, limitNum);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('appointments/booked')
  getBookedAppointments(
    @GetUser('id') userId: number,
    @Query('filter') filter?: string,
  ) {
    return this.doctorService.getBookedAppointments(userId, filter);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('appointments/all')
  getAllAppointments(@GetUser('id') userId: number) {
    return this.doctorService.getAllAppointments(userId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Patch('appointments/:id/cancel')
  cancelAppointment(
    @Param('id') id: string,
    @GetUser('id') userId: number,
  ) {
    return this.doctorService.cancelAppointment(parseInt(id), userId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('profile')
  getDoctorProfile(@GetUser('id') userId: number) {
    return this.doctorService.getDoctorProfile(userId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('dashboard/todays-appointments')
  getTodaysAppointments(@GetUser('id') userId: number) {
    return this.doctorService.getTodaysAppointments(userId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('dashboard/weekly-stats')
  getWeeklyStats(@GetUser('id') userId: number) {
    return this.doctorService.getWeeklyStats(userId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('dashboard/recent-patients')
  getRecentPatients(
    @GetUser('id') userId: number,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.doctorService.getRecentPatients(userId, limitNum);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('dashboard/upcoming-schedule')
  getUpcomingSchedule(@GetUser('id') userId: number) {
    return this.doctorService.getUpcomingSchedule(userId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @Get('patients/:patientId')
  getPatientDetails(
    @Param('patientId') patientId: string,
    @GetUser('id') userId: number,
  ) {
    return this.doctorService.getPatientDetails(parseInt(patientId), userId);
  }

  // Can be accessed by both Admin and Doctor
  @UseGuards(JwtGuard)
  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    return this.doctorService.getDoctorById(parseInt(id));
  }
}
