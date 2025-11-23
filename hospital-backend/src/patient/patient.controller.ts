import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    UseGuards,
    Query,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { PatientService } from './patient.service';
import {
    RegisterPatientDto,
    PatientResponseDto,
    UpdatePatientProfileDto,
} from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { GetUser } from '../auth/decorators';

@Controller('patients')
export class PatientController {
    constructor(
        private patientService: PatientService,
    ) {}

    // Admin/Receptionist routes
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
    @Post('register')
    registerPatient(
        @Body() dto: RegisterPatientDto,
        @GetUser('id') creatorId: number,
    ): Promise<PatientResponseDto> {
        return this.patientService.registerPatient(dto, creatorId);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
    @Get()
    getAllPatients(): Promise<PatientResponseDto[]> {
        return this.patientService.getAllPatients();
    }

    // Patient-only routes
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.PATIENT)
    @Get('profile')
    getPatientProfile(@GetUser('id') userId: number) {
        return this.patientService.getPatientProfile(userId);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.PATIENT)
    @Patch('profile')
    updatePatientProfile(
        @GetUser('id') userId: number,
        @Body() dto: UpdatePatientProfileDto,
    ) {
        return this.patientService.updatePatientProfile(userId, dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.PATIENT)
    @Get('dashboard/stats')
    getDashboardStats(@GetUser('id') userId: number) {
        return this.patientService.getDashboardStats(userId);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.PATIENT)
    @Get('dashboard/upcoming-appointments')
    getUpcomingAppointments(
        @GetUser('id') userId: number,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit ? parseInt(limit) : 5;
        return this.patientService.getUpcomingAppointments(userId, limitNum);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.PATIENT)
    @Get('dashboard/recent-checkups')
    getRecentCheckups(
        @GetUser('id') userId: number,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit ? parseInt(limit) : 5;
        return this.patientService.getRecentCheckups(userId, limitNum);
    }
}