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
import { DrugService } from './drug.service';
import { RegisterDrugDto, UpdateDrugDto } from './dto';
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

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateDrug(@Param('id') id: string, @Body() dto: UpdateDrugDto) {
    return this.drugService.updateDrug(parseInt(id), dto);
  }

  @Get()
  getAllDrugs() {
    return this.drugService.getAllDrugs();
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivateDrug(@Param('id') id: string) {
    return this.drugService.deactivateDrug(parseInt(id));
  }
}
