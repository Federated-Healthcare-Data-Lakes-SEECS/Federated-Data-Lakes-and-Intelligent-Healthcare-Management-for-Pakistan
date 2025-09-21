import { Controller, Post, Put, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { LabTestTemplateService } from './labtesttemplate.service';
import { RegisterLabTestTemplateDto, UpdateLabTestTemplateDto } from './dto/labtesttemplate.dto';
import { GetUser } from 'src/auth/decorators';

@Controller('labtesttemplate')
export class LabTestTemplateController {
  constructor(private readonly labTestTemplateService: LabTestTemplateService) {}

  @Post()
  async registerLabTestTemplate(
    @Body() dto: RegisterLabTestTemplateDto,
  ) {
    return this.labTestTemplateService.registerLabTestTemplate(dto);
  }

  @Put(':id')
  async updateLabTestTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLabTestTemplateDto,
  ) {
    return this.labTestTemplateService.updateLabTestTemplate(id, dto);
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
  async toggleLabTestTemplate(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labTestTemplateService.toggleLabTestTemplate(id);
  }
}
