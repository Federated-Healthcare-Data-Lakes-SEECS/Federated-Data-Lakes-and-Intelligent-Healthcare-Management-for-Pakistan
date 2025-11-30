import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { ReceptionistService } from './receptionist.service';
import {
    RegisterReceptionistDto,
    UpdateReceptionistDto,
    ReceptionistResponseDto,
    RegisterPatientDto,
    BookWalkinAppointmentDto,
    GetReceptionistAppointmentsQueryDto,
} from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { GetUser } from '../auth/decorators';

@UseGuards(JwtGuard, RolesGuard)
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

    @Patch(':id/activate')
    @Roles(UserRole.ADMIN)
    activateReceptionist(@Param('id') id: string): Promise<ReceptionistResponseDto> {
        return this.receptionistService.activateReceptionist(parseInt(id));
    }

    @Patch(':id/deactivate')
    @Roles(UserRole.ADMIN)
    deactivateReceptionist(@Param('id') id: string): Promise<ReceptionistResponseDto> {
        return this.receptionistService.deactivateReceptionist(parseInt(id));
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
    @Roles(UserRole.ADMIN)
    deleteReceptionist(
        @Param('id') id: string,
    ) {
        return this.receptionistService.deleteReceptionist(parseInt(id));
    }

    // ============================================================================
    // RECEPTIONIST PORTAL APIs
    // ============================================================================

    /**
     * Get receptionist profile
     */
    @Get('profile/me')
    @Roles(UserRole.RECEPTIONIST)
    getProfile(@GetUser('id') userId: number) {
        return this.receptionistService.getProfile(userId);
    }

    /**
     * Get dashboard statistics
     */
    @Get('dashboard/stats')
    @Roles(UserRole.RECEPTIONIST)
    getDashboardStats(@GetUser('id') userId: number) {
        return this.receptionistService.getDashboardStats(userId);
    }

    // ============================================================================
    // PATIENT MANAGEMENT APIs
    // ============================================================================

    /**
     * Register a new patient
     */
    @Post('patients/register')
    @Roles(UserRole.RECEPTIONIST)
    registerPatient(
        @Body() dto: RegisterPatientDto,
        @GetUser('id') userId: number,
    ) {
        return this.receptionistService.registerPatient(dto, userId);
    }

    /**
     * Search for existing patients
     */
    @Get('patients/search')
    @Roles(UserRole.RECEPTIONIST)
    searchPatients(@Query('q') searchTerm: string) {
        return this.receptionistService.searchPatients(searchTerm);
    }

    /**
     * Get patient details by ID
     */
    @Get('patients/:id')
    @Roles(UserRole.RECEPTIONIST)
    getPatientById(@Param('id') id: string) {
        return this.receptionistService.getPatientById(parseInt(id));
    }

    // ============================================================================
    // APPOINTMENT MANAGEMENT APIs
    // ============================================================================

    /**
     * Book a walk-in appointment
     */
    @Post('appointments/book-walkin')
    @Roles(UserRole.RECEPTIONIST)
    bookWalkinAppointment(
        @Body() dto: BookWalkinAppointmentDto,
        @GetUser('id') userId: number,
    ) {
        return this.receptionistService.bookWalkinAppointment(dto, userId);
    }

    /**
     * Get appointments booked by this receptionist
     */
    @Get('appointments/my-appointments')
    @Roles(UserRole.RECEPTIONIST)
    getMyAppointments(
        @GetUser('id') userId: number,
        @Query() query: GetReceptionistAppointmentsQueryDto,
    ) {
        return this.receptionistService.getMyAppointments(userId, query);
    }
}