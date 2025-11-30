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
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { LabTestService } from './labtest.service';
import { RegisterLabTestDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtGuard)
@Controller('labtests')
export class LabTestController {
  constructor(private labTestService: LabTestService) {}

  @Post('register')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  registerLabTest(
    @Body() dto: RegisterLabTestDto,
    @GetUser('id') creatorId: number,
  ) {
    return this.labTestService.registerLabTest(dto, creatorId);
  }

  @Get()
  getAllLabTests() {
    return this.labTestService.getAllLabTests();
  }

  @Get('templates/active')
  getActiveTemplates() {
    return this.labTestService.getActiveTemplates();
  }

  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleLabTest(@Param('id') id: string) {
    return this.labTestService.toggleLabTest(parseInt(id));
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  softDeleteLabTest(@Param('id') id: string) {
    return this.labTestService.softDeleteLabTest(parseInt(id));
  }

  @Get(':id')
  getLabTestById(@Param('id') id: string) {
    return this.labTestService.getLabTestById(parseInt(id));
  }

  @Get('department/:departmentName')
  getLabTestsByDepartment(@Param('departmentName') departmentName: string) {
    return this.labTestService.getLabTestsByDepartment(departmentName);
  }
}
