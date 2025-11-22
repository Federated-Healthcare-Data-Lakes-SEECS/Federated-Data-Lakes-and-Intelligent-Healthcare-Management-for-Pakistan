import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { DoctorService } from './doctor.service';
import { RegisterDoctorDto, UpdateDoctorDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('doctors')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Post('register')
  registerDoctor(@Body() dto: RegisterDoctorDto) {
    return this.doctorService.registerDoctor(dto);
  }

  @Patch(':id')
  updateDoctor(@Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.updateDoctor(parseInt(id), dto);
  }

  @Get()
  getAllDoctors() {
    return this.doctorService.getAllDoctors();
  }

  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    return this.doctorService.getDoctorById(parseInt(id));
  }

  @Get('department/:departmentName')
  getDoctorsByDepartment(@Param('departmentName') departmentName: string) {
    return this.doctorService.getDoctorsByDepartment(departmentName);
  }

  @Delete(':id')
  deleteDoctor(@Param('id') id: string) {
    return this.doctorService.deleteDoctor(parseInt(id));
  }
}
