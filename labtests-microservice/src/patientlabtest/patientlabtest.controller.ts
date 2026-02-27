import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { PatientLabTestService } from './patientlabtest.service';
import {
  OrderLabTestDto,
  SubmitLabTestResultsDto,
  ReviewLabTestDto,
} from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtGuard)
@Controller('patient-lab-tests')
export class PatientLabTestController {
  constructor(private patientLabTestService: PatientLabTestService) {}

  // ============================================================================
  // PATIENT ROUTES
  // ============================================================================

  @Get('available')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  getAvailableLabTests() {
    return this.patientLabTestService.getAvailableLabTests();
  }

  @Post('order')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  orderLabTest(
    @Body() dto: OrderLabTestDto,
    @GetUser('id') userId: number,
  ) {
    return this.patientLabTestService.orderLabTest(dto, userId);
  }

  @Get('my-tests')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  getMyLabTests(@GetUser('id') userId: number) {
    return this.patientLabTestService.getMyLabTests(userId);
  }

  @Get('my-tests/approved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  getMyApprovedLabTests(@GetUser('id') userId: number) {
    return this.patientLabTestService.getMyApprovedLabTests(userId);
  }

  @Get('my-tests/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  getMyLabTestDetails(
    @Param('id') id: string,
    @GetUser('id') userId: number,
  ) {
    return this.patientLabTestService.getMyLabTestDetails(parseInt(id), userId);
  }

  // ============================================================================
  // LAB TECHNICIAN ROUTES
  // ============================================================================

  @Get('technician/assigned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LAB_TECHNICIAN)
  getAssignedLabTests(@GetUser('id') userId: number) {
    return this.patientLabTestService.getAssignedLabTests(userId);
  }

  @Get('technician/completed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LAB_TECHNICIAN)
  getCompletedLabTests(@GetUser('id') userId: number) {
    return this.patientLabTestService.getCompletedLabTests(userId);
  }

  @Get('technician/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LAB_TECHNICIAN)
  getLabTestDetailsForTechnician(
    @Param('id') id: string,
    @GetUser('id') userId: number,
  ) {
    return this.patientLabTestService.getLabTestDetailsForTechnician(parseInt(id), userId);
  }

  @Get('technician/:id/pathologists')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LAB_TECHNICIAN)
  getAvailablePathologists(
    @Param('id') id: string,
    @GetUser('id') userId: number,
  ) {
    return this.patientLabTestService.getAvailablePathologists(parseInt(id), userId);
  }

  @Patch('technician/:id/collect-sample')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LAB_TECHNICIAN)
  collectSample(
    @Param('id') id: string,
    @GetUser('id') userId: number,
  ) {
    return this.patientLabTestService.collectSample(parseInt(id), userId);
  }

  @Patch('technician/:id/mark-performed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LAB_TECHNICIAN)
  markTestPerformed(
    @Param('id') id: string,
    @GetUser('id') userId: number,
  ) {
    return this.patientLabTestService.markTestPerformed(parseInt(id), userId);
  }

  @Patch('technician/:id/submit-results')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LAB_TECHNICIAN)
  submitResults(
    @Param('id') id: string,
    @Body() dto: SubmitLabTestResultsDto,
    @GetUser('id') userId: number,
  ) {
    return this.patientLabTestService.submitResults(parseInt(id), dto, userId);
  }

  // ============================================================================
  // PATHOLOGIST ROUTES
  // ============================================================================

  @Get('pathologist/for-review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATHOLOGIST)
  getLabTestsForReview(@GetUser('id') userId: number) {
    return this.patientLabTestService.getLabTestsForReview(userId);
  }

  @Get('pathologist/reviewed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATHOLOGIST)
  getReviewedLabTests(@GetUser('id') userId: number) {
    return this.patientLabTestService.getReviewedLabTests(userId);
  }

  @Get('pathologist/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATHOLOGIST)
  getLabTestDetailsForPathologist(
    @Param('id') id: string,
    @GetUser('id') userId: number,
  ) {
    return this.patientLabTestService.getLabTestDetailsForPathologist(parseInt(id), userId);
  }

  @Patch('pathologist/:id/review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PATHOLOGIST)
  reviewLabTest(
    @Param('id') id: string,
    @Body() dto: ReviewLabTestDto,
    @GetUser('id') userId: number,
  ) {
    return this.patientLabTestService.reviewLabTest(parseInt(id), dto, userId);
  }

  // ============================================================================
  // RECEPTIONIST ROUTES
  // ============================================================================

  @Get('lookup/patient/:patientId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECEPTIONIST)
  lookupLabTestsByPatient(@Param('patientId') patientId: string) {
    return this.patientLabTestService.lookupLabTestsByPatient(parseInt(patientId));
  }

  @Get('lookup/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECEPTIONIST)
  lookupLabTest(@Param('id') id: string) {
    return this.patientLabTestService.lookupLabTest(parseInt(id));
  }
}
