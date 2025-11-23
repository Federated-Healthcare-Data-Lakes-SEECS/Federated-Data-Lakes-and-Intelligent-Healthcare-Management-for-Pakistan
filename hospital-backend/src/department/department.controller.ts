import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { DepartmentService } from './department.service';
import { RegisterDepartmentDto, UpdateDepartmentDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('departments')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Post('register')
  registerDepartment(@Body() dto: RegisterDepartmentDto) {
    return this.departmentService.registerDepartment(dto);
  }

  @Put(':id')
  updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.updateDepartment(parseInt(id), dto);
  }

  @Get()
  getAllDepartments() {
    return this.departmentService.getAllDepartments();
  }

  @Get('standard')
  getStandardDepartments() {
    return this.departmentService.getStandardDepartments();
  }
}
