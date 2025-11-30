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
import { DrugService } from './drug.service';
import { RegisterDrugDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtGuard)
@Controller('drugs')
export class DrugController {
  constructor(private drugService: DrugService) {}

  @Post('register')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  registerDrug(@Body() dto: RegisterDrugDto, @GetUser('id') creatorId: number) {
    return this.drugService.registerDrug(dto, creatorId);
  }

  @Get()
  getAllDrugs() {
    return this.drugService.getAllDrugs();
  }

  @Get(':id')
  getDrugById(@Param('id') id: string) {
    return this.drugService.getDrugById(parseInt(id));
  }

  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleDrug(@Param('id') id: string) {
    return this.drugService.toggleDrug(parseInt(id));
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  softDeleteDrug(@Param('id') id: string) {
    return this.drugService.softDeleteDrug(parseInt(id));
  }
}
