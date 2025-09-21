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
import { ReceptionistService } from './receptionist.service';
import {
    RegisterReceptionistDto,
    UpdateReceptionistDto,
    ReceptionistResponseDto,
} from './dto';
import { Roles, UserRole } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('receptionists')
export class ReceptionistController {
    constructor(
        private receptionistService: ReceptionistService,
    ) {}

    @Post('register')
    registerReceptionist(
        @Body() dto: RegisterReceptionistDto,
    ): Promise<ReceptionistResponseDto> {
        return this.receptionistService.registerReceptionist(dto);
    }

    @Patch(':id')
    updateReceptionist(
        @Param('id') id: string,
        @Body() dto: UpdateReceptionistDto,
    ): Promise<ReceptionistResponseDto> {
        return this.receptionistService.updateReceptionist(parseInt(id), dto);
    }

    @Get()
    getAllReceptionists(): Promise<ReceptionistResponseDto[]> {
        return this.receptionistService.getAllReceptionists();
    }

    @Get(':id')
    getReceptionistById(
        @Param('id') id: string,
    ): Promise<ReceptionistResponseDto> {
        return this.receptionistService.getReceptionistById(parseInt(id));
    }

    @Delete(':id')
    deleteReceptionist(
        @Param('id') id: string,
    ) {
        return this.receptionistService.deleteReceptionist(parseInt(id));
    }
}