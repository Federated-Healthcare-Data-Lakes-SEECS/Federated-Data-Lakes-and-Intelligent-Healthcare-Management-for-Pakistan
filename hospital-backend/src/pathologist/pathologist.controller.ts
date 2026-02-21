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
import { PathologistService } from './pathologist.service';
import { RegisterPathologistDto, UpdatePathologistDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('pathologists')
@UseGuards(JwtGuard, RolesGuard)
export class PathologistController {
  constructor(private pathologistService: PathologistService) {}

  // Admin-only routes
  @Post('register')
  @Roles(UserRole.ADMIN)
  registerPathologist(@Body() dto: RegisterPathologistDto) {
    return this.pathologistService.registerPathologist(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  updatePathologist(@Param('id') id: string, @Body() dto: UpdatePathologistDto) {
    return this.pathologistService.updatePathologist(parseInt(id), dto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  activatePathologist(@Param('id') id: string) {
    return this.pathologistService.activatePathologist(parseInt(id));
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  deactivatePathologist(@Param('id') id: string) {
    return this.pathologistService.deactivatePathologist(parseInt(id));
  }

  @Get()
  @Roles(UserRole.ADMIN)
  getAllPathologists() {
    return this.pathologistService.getAllPathologists();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  getPathologistById(@Param('id') id: string) {
    return this.pathologistService.getPathologistById(parseInt(id));
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deletePathologist(@Param('id') id: string) {
    return this.pathologistService.deletePathologist(parseInt(id));
  }

  @Get('department/:departmentName')
  @Roles(UserRole.ADMIN)
  getPathologistsByDepartment(@Param('departmentName') departmentName: string) {
    return this.pathologistService.getPathologistsByDepartment(departmentName);
  }
}
