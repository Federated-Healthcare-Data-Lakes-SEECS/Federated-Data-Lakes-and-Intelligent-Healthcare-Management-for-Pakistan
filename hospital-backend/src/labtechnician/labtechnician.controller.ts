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
import { LabTechnicianService } from './labtechnician.service';
import { RegisterLabTechnicianDto, UpdateLabTechnicianDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('lab-technicians')
@UseGuards(JwtGuard, RolesGuard)
export class LabTechnicianController {
  constructor(private labTechnicianService: LabTechnicianService) {}

  // Admin-only routes
  @Post('register')
  @Roles(UserRole.ADMIN)
  registerLabTechnician(@Body() dto: RegisterLabTechnicianDto) {
    return this.labTechnicianService.registerLabTechnician(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  updateLabTechnician(@Param('id') id: string, @Body() dto: UpdateLabTechnicianDto) {
    return this.labTechnicianService.updateLabTechnician(parseInt(id), dto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  activateLabTechnician(@Param('id') id: string) {
    return this.labTechnicianService.activateLabTechnician(parseInt(id));
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  deactivateLabTechnician(@Param('id') id: string) {
    return this.labTechnicianService.deactivateLabTechnician(parseInt(id));
  }

  @Get()
  @Roles(UserRole.ADMIN)
  getAllLabTechnicians() {
    return this.labTechnicianService.getAllLabTechnicians();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  getLabTechnicianById(@Param('id') id: string) {
    return this.labTechnicianService.getLabTechnicianById(parseInt(id));
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deleteLabTechnician(@Param('id') id: string) {
    return this.labTechnicianService.deleteLabTechnician(parseInt(id));
  }

  @Get('department/:departmentName')
  @Roles(UserRole.ADMIN)
  getLabTechniciansByDepartment(@Param('departmentName') departmentName: string) {
    return this.labTechnicianService.getLabTechniciansByDepartment(departmentName);
  }
}
