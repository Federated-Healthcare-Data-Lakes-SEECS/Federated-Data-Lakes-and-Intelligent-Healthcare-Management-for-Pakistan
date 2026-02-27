import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import {
  OrderLabTestDto,
  SubmitLabTestResultsDto,
  ReviewLabTestDto,
  PatientLabTestResponseDto,
  OrderLabTestResponseDto,
  PatientLabTestSummaryDto,
  PathologistListDto,
} from './dto';

@Injectable()
export class PatientLabTestService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // PATIENT METHODS
  // ============================================================================

  /**
   * Order a new lab test - assigns the least busy lab technician from the same department
   */
  async orderLabTest(dto: OrderLabTestDto, userId: number): Promise<OrderLabTestResponseDto> {
    // Get the patient
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Get the lab test with department info
    const labTest = await this.prisma.labTest.findFirst({
      where: { id: dto.labTestId, isActive: true, deletedAt: null },
      include: { department: true },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found or is inactive');
    }

    // Find the lab technician with the least number of active lab tests in the same department
    const labTechnician = await this.findLeastBusyLabTechnician(labTest.departmentId);

    if (!labTechnician) {
      throw new BadRequestException('No lab technician available in this department');
    }

    // Create the patient lab test
    const patientLabTest = await this.prisma.patientLabTest.create({
      data: {
        patientId: patient.id,
        labTestId: labTest.id,
        status: 'ORDERED',
        labTechnicianAssigned: labTechnician.id,
      },
      include: {
        labTest: {
          include: { department: true },
        },
        labTechnician: {
          include: { user: true },
        },
      },
    });

    return {
      id: patientLabTest.id,
      labTestName: patientLabTest.labTest.name,
      departmentName: patientLabTest.labTest.department.name,
      status: patientLabTest.status,
      orderedAt: patientLabTest.orderedAt,
      labTechnicianName: `${patientLabTest.labTechnician?.user.firstName} ${patientLabTest.labTechnician?.user.lastName}`,
      message: 'Lab test ordered successfully. Please visit the hospital within the next 2 working days for sample collection.',
    };
  }

  /**
   * Get all lab tests for a patient
   */
  async getMyLabTests(userId: number): Promise<PatientLabTestSummaryDto[]> {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const labTests = await this.prisma.patientLabTest.findMany({
      where: { patientId: patient.id },
      include: {
        labTest: {
          include: { department: true },
        },
        labTechnician: {
          include: { user: true },
        },
      },
      orderBy: { orderedAt: 'desc' },
    });

    return labTests.map((lt) => ({
      id: lt.id,
      labTestName: lt.labTest.name,
      departmentName: lt.labTest.department.name,
      status: lt.status,
      orderedAt: lt.orderedAt,
      sampleCollectedAt: lt.sampleCollectedAt,
      performedAt: lt.performedAt,
      resultsAddedAt: lt.resultsAddedAt,
      reviewedAt: lt.reviewedAt,
      labTechnicianName: lt.labTechnician
        ? `${lt.labTechnician.user.firstName} ${lt.labTechnician.user.lastName}`
        : null,
    }));
  }

  /**
   * Get approved lab test results for patient
   */
  async getMyApprovedLabTests(userId: number): Promise<PatientLabTestResponseDto[]> {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const labTests = await this.prisma.patientLabTest.findMany({
      where: { 
        patientId: patient.id,
        status: 'APPROVED',
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
      orderBy: { reviewedAt: 'desc' },
    });

    return this.mapToResponseDtos(labTests);
  }

  /**
   * Get specific lab test details for patient (only if approved)
   */
  async getMyLabTestDetails(patientLabTestId: number, userId: number): Promise<PatientLabTestResponseDto> {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const labTest = await this.prisma.patientLabTest.findFirst({
      where: {
        id: patientLabTestId,
        patientId: patient.id,
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found');
    }

    // For non-approved tests, don't return results
    const responseLabTest = {
      ...labTest,
      result: labTest.status === 'APPROVED' ? labTest.result : null,
    };

    return this.mapToResponseDto(responseLabTest);
  }

  // ============================================================================
  // LAB TECHNICIAN METHODS
  // ============================================================================

  /**
   * Get all lab tests assigned to a lab technician
   */
  async getAssignedLabTests(userId: number): Promise<PatientLabTestResponseDto[]> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { userId },
    });

    if (!labTechnician) {
      throw new NotFoundException('Lab technician not found');
    }

    const labTests = await this.prisma.patientLabTest.findMany({
      where: {
        labTechnicianAssigned: labTechnician.id,
        status: {
          in: ['ORDERED', 'SAMPLE_COLLECTED', 'PERFORMED', 'RESULTS_ADDED', 'REJECTED'],
        },
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
      orderBy: { orderedAt: 'desc' },
    });

    return this.mapToResponseDtos(labTests);
  }

  /**
   * Get all completed lab tests for a lab technician (submitted results that are under review or approved)
   */
  async getCompletedLabTests(userId: number): Promise<PatientLabTestResponseDto[]> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { userId },
    });

    if (!labTechnician) {
      throw new NotFoundException('Lab technician not found');
    }

    const labTests = await this.prisma.patientLabTest.findMany({
      where: {
        labTechnicianAssigned: labTechnician.id,
        status: {
          in: ['UNDER_REVIEW', 'APPROVED'],
        },
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
      orderBy: { resultsAddedAt: 'desc' },
    });

    return this.mapToResponseDtos(labTests);
  }

  /**
   * Get lab test details for lab technician
   */
  async getLabTestDetailsForTechnician(patientLabTestId: number, userId: number): Promise<PatientLabTestResponseDto> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { userId },
    });

    if (!labTechnician) {
      throw new NotFoundException('Lab technician not found');
    }

    const labTest = await this.prisma.patientLabTest.findFirst({
      where: {
        id: patientLabTestId,
        labTechnicianAssigned: labTechnician.id,
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found or not assigned to you');
    }

    return this.mapToResponseDto(labTest);
  }

  /**
   * Mark sample as collected
   */
  async collectSample(patientLabTestId: number, userId: number): Promise<PatientLabTestResponseDto> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { userId },
    });

    if (!labTechnician) {
      throw new NotFoundException('Lab technician not found');
    }

    const labTest = await this.prisma.patientLabTest.findFirst({
      where: {
        id: patientLabTestId,
        labTechnicianAssigned: labTechnician.id,
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found or not assigned to you');
    }

    if (labTest.status !== 'ORDERED') {
      throw new BadRequestException('Sample can only be collected for ordered tests');
    }

    const updatedLabTest = await this.prisma.patientLabTest.update({
      where: { id: patientLabTestId },
      data: {
        status: 'SAMPLE_COLLECTED',
        sampleCollectedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedLabTest);
  }

  /**
   * Mark test as performed
   */
  async markTestPerformed(patientLabTestId: number, userId: number): Promise<PatientLabTestResponseDto> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { userId },
    });

    if (!labTechnician) {
      throw new NotFoundException('Lab technician not found');
    }

    const labTest = await this.prisma.patientLabTest.findFirst({
      where: {
        id: patientLabTestId,
        labTechnicianAssigned: labTechnician.id,
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found or not assigned to you');
    }

    if (labTest.status !== 'SAMPLE_COLLECTED') {
      throw new BadRequestException('Test can only be marked as performed after sample collection');
    }

    const updatedLabTest = await this.prisma.patientLabTest.update({
      where: { id: patientLabTestId },
      data: {
        status: 'PERFORMED',
        performedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedLabTest);
  }

  /**
   * Submit test results with pathologist assignment
   */
  async submitResults(
    patientLabTestId: number,
    dto: SubmitLabTestResultsDto,
    userId: number,
  ): Promise<PatientLabTestResponseDto> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { userId },
    });

    if (!labTechnician) {
      throw new NotFoundException('Lab technician not found');
    }

    const labTest = await this.prisma.patientLabTest.findFirst({
      where: {
        id: patientLabTestId,
        labTechnicianAssigned: labTechnician.id,
      },
      include: {
        labTest: true,
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found or not assigned to you');
    }

    if (!['PERFORMED', 'REJECTED'].includes(labTest.status)) {
      throw new BadRequestException('Results can only be submitted after test is performed or for rejected tests');
    }

    // Validate pathologist exists and belongs to the same department
    const pathologist = await this.prisma.pathologist.findFirst({
      where: {
        id: dto.pathologistId,
        departmentId: labTest.labTest.departmentId,
      },
    });

    if (!pathologist) {
      throw new BadRequestException('Invalid pathologist or pathologist not in the same department');
    }

    const updatedLabTest = await this.prisma.patientLabTest.update({
      where: { id: patientLabTestId },
      data: {
        status: 'UNDER_REVIEW',
        result: dto.result,
        lab_technicianNotes: dto.labTechnicianNotes,
        pathologistAssigned: dto.pathologistId,
        resultsAddedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedLabTest);
  }

  /**
   * Get available pathologists for a lab test (same department)
   */
  async getAvailablePathologists(patientLabTestId: number, userId: number): Promise<PathologistListDto[]> {
    const labTechnician = await this.prisma.labTechnician.findUnique({
      where: { userId },
    });

    if (!labTechnician) {
      throw new NotFoundException('Lab technician not found');
    }

    const labTest = await this.prisma.patientLabTest.findFirst({
      where: {
        id: patientLabTestId,
        labTechnicianAssigned: labTechnician.id,
      },
      include: {
        labTest: true,
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found or not assigned to you');
    }

    const pathologists = await this.prisma.pathologist.findMany({
      where: {
        departmentId: labTest.labTest.departmentId,
      },
      include: {
        user: true,
        department: true,
      },
    });

    return pathologists.map((p) => ({
      id: p.id,
      firstName: p.user.firstName,
      lastName: p.user.lastName ?? '',
      email: p.user.email,
      specialization: p.specialization,
      departmentName: p.department.name,
    }));
  }

  // ============================================================================
  // PATHOLOGIST METHODS
  // ============================================================================

  /**
   * Get all lab tests under review for a pathologist
   */
  async getLabTestsForReview(userId: number): Promise<PatientLabTestResponseDto[]> {
    const pathologist = await this.prisma.pathologist.findUnique({
      where: { userId },
    });

    if (!pathologist) {
      throw new NotFoundException('Pathologist not found');
    }

    const labTests = await this.prisma.patientLabTest.findMany({
      where: {
        pathologistAssigned: pathologist.id,
        status: 'UNDER_REVIEW',
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
      orderBy: { resultsAddedAt: 'desc' },
    });

    return this.mapToResponseDtos(labTests);
  }

  /**
   * Get all reviewed lab tests for a pathologist (history)
   */
  async getReviewedLabTests(userId: number): Promise<PatientLabTestResponseDto[]> {
    const pathologist = await this.prisma.pathologist.findUnique({
      where: { userId },
    });

    if (!pathologist) {
      throw new NotFoundException('Pathologist not found');
    }

    const labTests = await this.prisma.patientLabTest.findMany({
      where: {
        pathologistAssigned: pathologist.id,
        status: {
          in: ['APPROVED', 'REJECTED'],
        },
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
      orderBy: { reviewedAt: 'desc' },
    });

    return this.mapToResponseDtos(labTests);
  }

  /**
   * Get lab test details for pathologist
   */
  async getLabTestDetailsForPathologist(patientLabTestId: number, userId: number): Promise<PatientLabTestResponseDto> {
    const pathologist = await this.prisma.pathologist.findUnique({
      where: { userId },
    });

    if (!pathologist) {
      throw new NotFoundException('Pathologist not found');
    }

    const labTest = await this.prisma.patientLabTest.findFirst({
      where: {
        id: patientLabTestId,
        pathologistAssigned: pathologist.id,
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found or not assigned to you');
    }

    return this.mapToResponseDto(labTest);
  }

  /**
   * Review (approve/reject) a lab test
   */
  async reviewLabTest(
    patientLabTestId: number,
    dto: ReviewLabTestDto,
    userId: number,
  ): Promise<PatientLabTestResponseDto> {
    const pathologist = await this.prisma.pathologist.findUnique({
      where: { userId },
    });

    if (!pathologist) {
      throw new NotFoundException('Pathologist not found');
    }

    const labTest = await this.prisma.patientLabTest.findFirst({
      where: {
        id: patientLabTestId,
        pathologistAssigned: pathologist.id,
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found or not assigned to you');
    }

    if (labTest.status !== 'UNDER_REVIEW') {
      throw new BadRequestException('Only tests under review can be reviewed');
    }

    const updatedLabTest = await this.prisma.patientLabTest.update({
      where: { id: patientLabTestId },
      data: {
        status: dto.status,
        pathologistNotes: dto.pathologistNotes,
        reviewedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedLabTest);
  }

  // ============================================================================
  // RECEPTIONIST METHODS
  // ============================================================================

  /**
   * Look up a lab test by ID (for receptionist)
   */
  async lookupLabTest(patientLabTestId: number): Promise<PatientLabTestResponseDto> {
    const labTest = await this.prisma.patientLabTest.findUnique({
      where: { id: patientLabTestId },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found');
    }

    return this.mapToResponseDto(labTest);
  }

  /**
   * Look up lab tests by patient ID (for receptionist)
   */
  async lookupLabTestsByPatient(patientId: number): Promise<PatientLabTestResponseDto[]> {
    const labTests = await this.prisma.patientLabTest.findMany({
      where: { patientId },
      include: {
        patient: { include: { user: true } },
        labTest: {
          include: { 
            department: true,
            template: true,
          },
        },
        labTechnician: {
          include: { 
            user: true,
            department: true,
          },
        },
      },
      orderBy: { orderedAt: 'desc' },
    });

    return labTests.map(lt => this.mapToResponseDto(lt));
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Find the lab technician with the least number of active lab tests in a department
   */
  private async findLeastBusyLabTechnician(departmentId: number) {
    // Get all lab technicians in the department
    const labTechnicians = await this.prisma.labTechnician.findMany({
      where: { departmentId },
      include: { user: true },
    });

    if (labTechnicians.length === 0) {
      return null;
    }

    // Count active lab tests for each technician
    const technicianWorkloads = await Promise.all(
      labTechnicians.map(async (tech) => {
        const activeCount = await this.prisma.patientLabTest.count({
          where: {
            labTechnicianAssigned: tech.id,
            status: {
              in: ['ORDERED', 'SAMPLE_COLLECTED', 'PERFORMED'],
            },
          },
        });
        return { technician: tech, activeCount };
      }),
    );

    // Sort by workload and return the least busy one
    technicianWorkloads.sort((a, b) => a.activeCount - b.activeCount);
    return technicianWorkloads[0].technician;
  }

  /**
   * Map database result to response DTO
   */
  private mapToResponseDto(labTest: any): PatientLabTestResponseDto {
    return {
      id: labTest.id,
      status: labTest.status,
      result: labTest.result,
      labTechnicianNotes: labTest.lab_technicianNotes,
      pathologistNotes: labTest.pathologistNotes,
      orderedAt: labTest.orderedAt,
      sampleCollectedAt: labTest.sampleCollectedAt,
      performedAt: labTest.performedAt,
      resultsAddedAt: labTest.resultsAddedAt,
      reviewedAt: labTest.reviewedAt,
      createdAt: labTest.createdAt,
      updatedAt: labTest.updatedAt,
      patient: labTest.patient ? {
        id: labTest.patient.id,
        firstName: labTest.patient.user.firstName,
        lastName: labTest.patient.user.lastName ?? '',
        email: labTest.patient.user.email,
        gender: labTest.patient.user.gender,
        cnic: labTest.patient.user.cnic ?? '',
        phoneNumber: labTest.patient.phoneNumber ?? '',
      } : null as any,
      labTest: {
        id: labTest.labTest.id,
        name: labTest.labTest.name,
        description: labTest.labTest.description ?? '',
        departmentName: labTest.labTest.department.name,
        templateId: labTest.labTest.templateId,
        templateName: labTest.labTest.template?.name ?? '',
        formStructure: labTest.labTest.template?.formStructure ?? null,
      },
      labTechnician: labTest.labTechnician ? {
        id: labTest.labTechnician.id,
        firstName: labTest.labTechnician.user.firstName,
        lastName: labTest.labTechnician.user.lastName ?? '',
        email: labTest.labTechnician.user.email,
        specialization: labTest.labTechnician.specialization,
        departmentName: labTest.labTechnician.department?.name ?? '',
      } : null,
      pathologist: null, // Will be populated separately if needed
    };
  }

  /**
   * Map multiple database results to response DTOs
   */
  private mapToResponseDtos(labTests: any[]): PatientLabTestResponseDto[] {
    return labTests.map((lt) => this.mapToResponseDto(lt));
  }

  /**
   * Get available lab tests for ordering (patient)
   */
  async getAvailableLabTests() {
    const labTests = await this.prisma.labTest.findMany({
      where: { 
        isActive: true, 
        deletedAt: null,
        // Only show tests from departments that have at least one lab technician
        department: {
          labTechnicians: {
            some: {},
          },
        },
      },
      include: { 
        department: true,
        template: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return labTests.map((lt) => ({
      id: lt.id,
      name: lt.name,
      description: lt.description,
      departmentName: lt.department.name,
      templateName: lt.template?.name ?? '',
    }));
  }
}
