import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { PatientService } from './patient.service';
import {
    RegisterPatientDto,
    PatientResponseDto
} from './dto';
import { Roles, UserRole } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GetUser } from '../auth/decorators';

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
@Controller('patients')
export class PatientController {
    constructor(
        private patientService: PatientService,
    ) {}

    @Post('register')
    registerPatient(
        @Body() dto: RegisterPatientDto,
        @GetUser('id') creatorId: number,
    ): Promise<PatientResponseDto> {
        return this.patientService.registerPatient(dto, creatorId);
    }

    @Get()
    getAllPatients(): Promise<PatientResponseDto[]> {
        return this.patientService.getAllPatients();
    }
}