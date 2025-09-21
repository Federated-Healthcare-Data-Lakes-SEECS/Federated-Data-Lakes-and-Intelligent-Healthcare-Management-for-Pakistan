import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { LabTestService } from './labtest.service';
import { RegisterLabTestDto, UpdateLabTestDto } from './dto';
import { Roles, UserRole } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('lab-tests')
export class LabTestController {
  constructor(private labTestService: LabTestService) {}

  @Post('register')
  registerLabTest(
    @Body() dto: RegisterLabTestDto,
    @GetUser('id') creatorId: number,
  ) {
    return this.labTestService.registerLabTest(dto, creatorId);
  }

  @Patch(':id')
  updateLabTest(@Param('id') id: string, @Body() dto: UpdateLabTestDto) {
    return this.labTestService.updateLabTest(parseInt(id), dto);
  }

  @Get()
  getAllLabTests() {
    return this.labTestService.getAllLabTests();
  }

  @Patch(':id/toggle')
  toggleLabTest(@Param('id') id: string) {
    return this.labTestService.toggleLabTest(parseInt(id));
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
