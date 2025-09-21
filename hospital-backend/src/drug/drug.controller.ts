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
import { Roles, UserRole } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('drugs')
export class DrugController {
  constructor(private drugService: DrugService) {}

  @Post('register')
  registerDrug(@Body() dto: RegisterDrugDto, @GetUser('id') creatorId: number) {
    return this.drugService.registerDrug(dto, creatorId);
  }

  @Patch(':id')
  updateDrug(@Param('id') id: string, @Body() dto: UpdateDrugDto) {
    return this.drugService.updateDrug(parseInt(id), dto);
  }

  @Get()
  getAllDrugs() {
    return this.drugService.getAllDrugs();
  }

  @Patch(':id/deactivate')
  deactivateDrug(@Param('id') id: string) {
    return this.drugService.deactivateDrug(parseInt(id));
  }
}
