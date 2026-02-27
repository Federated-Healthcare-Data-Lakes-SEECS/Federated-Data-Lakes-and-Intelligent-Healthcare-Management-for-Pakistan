import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { LabTestTemplateService } from './labtesttemplate.service';
import { RegisterLabTestTemplateDto } from './dto/labtesttemplate.dto';
import { JwtGuard } from '../auth/guards';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtGuard)
@Controller('labtesttemplate')
export class LabTestTemplateController {
  constructor(private readonly labTestTemplateService: LabTestTemplateService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async registerLabTestTemplate(
    @Body() dto: RegisterLabTestTemplateDto,
  ) {
    return this.labTestTemplateService.registerLabTestTemplate(dto);
  }

  @Get()
  async getAllLabTestTemplates() {
    return this.labTestTemplateService.getAllLabTestTemplates();
  }

  @Get(':id')
  async getLabTestTemplateById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labTestTemplateService.getLabTestTemplateById(id);
  }

  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleLabTestTemplate(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labTestTemplateService.toggleLabTestTemplate(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async softDeleteLabTestTemplate(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labTestTemplateService.softDeleteLabTestTemplate(id);
  }
}
