import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
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

    // ============================================================
    // PATIENT-ONLY ROUTES (must come BEFORE :id wildcard routes)
    // ============================================================

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

    // ============================================================
    // RECEPTIONIST ROUTES
    // ============================================================

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.RECEPTIONIST)
    @Post('register')
    registerPatient(
        @Body() dto: RegisterPatientDto,
    ): Promise<PatientResponseDto> {
        return this.patientService.registerPatient(dto);
    }

    // ============================================================
    // ADMIN/RECEPTIONIST ROUTES (wildcard :id routes MUST come last)
    // ============================================================

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
    @Get()
    getAllPatients(): Promise<PatientResponseDto[]> {
        return this.patientService.getAllPatients();
    }

    // Admin-only: activate/deactivate patients
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id/activate')
    activatePatient(@Param('id') id: string): Promise<PatientResponseDto> {
        return this.patientService.activatePatient(parseInt(id));
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id/deactivate')
    deactivatePatient(@Param('id') id: string): Promise<PatientResponseDto> {
        return this.patientService.deactivatePatient(parseInt(id));
    }

    // This MUST be the last GET route to avoid matching 'profile', 'dashboard/*' as :id
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
    @Get(':id')
    getPatientById(@Param('id') id: string): Promise<PatientResponseDto> {
        return this.patientService.getPatientById(parseInt(id));
    }
}