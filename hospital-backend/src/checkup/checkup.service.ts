import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckupDto, SaveDraftDto, CheckupResponseDto } from './dto';
import { AudioProcessingService } from './audio-processing.service';

@Injectable()
export class CheckupService {
  private readonly logger = new Logger(CheckupService.name);

  constructor(
    private prisma: PrismaService,
    private audioProcessingService: AudioProcessingService,
  ) {}

  /**
   * Save checkup as draft - does not complete appointment
   * Can be called multiple times to update the draft
   */
  async saveDraft(
    dto: SaveDraftDto,
    userId: number,
  ): Promise<CheckupResponseDto> {
    await this.verifyDoctorAccess(dto.appointmentId, userId);

    // Check for existing checkup
    const existingCheckup = await this.prisma.checkup.findUnique({
      where: { appointmentId: dto.appointmentId },
      include: {
        prescription: true,
        checkupTestRecommendation: true,
      },
    });

    if (existingCheckup && !existingCheckup.isDraft) {
      throw new BadRequestException(
        'Cannot save draft - checkup is already submitted',
      );
    }

    if (existingCheckup) {
      // Update existing draft
      return this.updateDraft(existingCheckup, dto, userId);
    }

    // Create new draft
    return this.createDraft(dto, userId);
  }

  /**
   * Submit checkup with optional audio - completes the appointment
   */
  async submitCheckup(
    dto: CreateCheckupDto,
    audioBuffer: Buffer | null,
    audioMimeType: string | null,
    userId: number,
  ): Promise<CheckupResponseDto> {
    await this.verifyDoctorAccess(dto.appointmentId, userId);

    // Check for existing checkup
    const existingCheckup = await this.prisma.checkup.findUnique({
      where: { appointmentId: dto.appointmentId },
    });

    if (existingCheckup && !existingCheckup.isDraft) {
      throw new BadRequestException(
        'Checkup already submitted for this appointment',
      );
    }

    // Validate required fields for submission
    if (!dto.symptoms || !dto.diagnosis) {
      throw new BadRequestException(
        'Symptoms and diagnosis are required for submission',
      );
    }

    // Validate drugs exist - filter out any medications with undefined drugId
    if (dto.medications && dto.medications.length > 0) {
      const validMedications = dto.medications.filter((m) => m.drugId !== undefined && m.drugId !== null);
      dto.medications = validMedications; // Update dto with only valid medications
      
      if (validMedications.length > 0) {
        const drugIds = validMedications.map((m) => m.drugId);
        const drugs = await this.prisma.drug.findMany({
          where: { id: { in: drugIds }, isActive: true },
        });
        if (drugs.length !== drugIds.length) {
          throw new BadRequestException('One or more drugs not found or inactive');
        }
      }
    }

    // Validate lab tests exist - filter out any undefined values
    if (dto.recommendedLabTestIds && dto.recommendedLabTestIds.length > 0) {
      const validLabTestIds = dto.recommendedLabTestIds.filter((id) => id !== undefined && id !== null);
      dto.recommendedLabTestIds = validLabTestIds; // Update dto with only valid IDs
      
      if (validLabTestIds.length > 0) {
        const labTests = await this.prisma.labTest.findMany({
          where: { id: { in: validLabTestIds }, isActive: true },
        });
        if (labTests.length !== validLabTestIds.length) {
          throw new BadRequestException('One or more lab tests not found or inactive');
        }
      }
    }

    let checkupId: number;

    if (existingCheckup) {
      // Update draft and mark as submitted
      checkupId = await this.finalizeDraft(existingCheckup.id, dto);
    } else {
      // Create new checkup as submitted
      checkupId = await this.createSubmittedCheckup(dto);
    }

    // Save audio if provided
    if (audioBuffer && audioMimeType) {
      await this.saveAudio(checkupId, audioBuffer, audioMimeType);
    }

    // Mark appointment as completed
    await this.completeAppointment(dto.appointmentId);

    return this.getCheckupById(checkupId, userId);
  }

  /**
   * Get checkup for an appointment (returns draft or completed)
   */
  async getCheckupByAppointmentId(
    appointmentId: number,
    userId: number,
  ): Promise<CheckupResponseDto | null> {
    await this.verifyDoctorAccess(appointmentId, userId);

    const checkup = await this.prisma.checkup.findUnique({
      where: { appointmentId },
      include: this.getCheckupInclude(),
    });

    if (!checkup) {
      return null;
    }

    return this.transformToCheckupResponse(checkup);
  }

  async getCheckupHistory(userId: number): Promise<CheckupResponseDto[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const checkups = await this.prisma.checkup.findMany({
      where: {
        isDraft: false, // Only show submitted checkups in history
        appointment: {
          slot: {
            schedule: {
              doctorId: doctor.id,
            },
          },
        },
      },
      include: this.getCheckupInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return checkups.map((checkup) => this.transformToCheckupResponse(checkup));
  }

  async getCheckupById(
    id: number,
    userId: number,
  ): Promise<CheckupResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const checkup = await this.prisma.checkup.findUnique({
      where: { id },
      include: this.getCheckupInclude(),
    });

    if (!checkup) {
      throw new NotFoundException('Checkup not found');
    }

    // Verify ownership
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: checkup.appointmentId },
      include: {
        slot: {
          include: {
            schedule: true,
          },
        },
      },
    });

    if (appointment?.slot.schedule.doctorId !== doctor.id) {
      throw new ForbiddenException(
        'You can only view checkups for your own appointments',
      );
    }

    return this.transformToCheckupResponse(checkup);
  }

  // Legacy method for backward compatibility
  async createCheckup(
    dto: CreateCheckupDto,
    userId: number,
  ): Promise<CheckupResponseDto> {
    return this.submitCheckup(dto, null, null, userId);
  }

  // ==================== PRIVATE METHODS ====================

  private async verifyDoctorAccess(
    appointmentId: number,
    userId: number,
  ): Promise<{ doctorId: number }> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        slot: {
          include: {
            schedule: true,
          },
        },
        onlineAppointment: true,
        walkinAppointment: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.slot.schedule.doctorId !== doctor.id) {
      throw new ForbiddenException(
        'You can only manage checkups for your own appointments',
      );
    }

    // Check if appointment is already completed
    const isOnline = !!appointment.onlineAppointment;
    const appointmentStatus = isOnline
      ? appointment.onlineAppointment?.status
      : appointment.walkinAppointment?.status;

    if (appointmentStatus === 'COMPLETED') {
      throw new BadRequestException('Appointment is already completed');
    }

    return { doctorId: doctor.id };
  }

  private async createDraft(
    dto: SaveDraftDto,
    userId: number,
  ): Promise<CheckupResponseDto> {
    const checkup = await this.prisma.$transaction(async (prisma) => {
      // Create prescription
      const prescription = await prisma.prescription.create({
        data: {
          additionalMedications: dto.additionalMedications,
        },
      });

      // Create medications if any
      if (dto.medications && dto.medications.length > 0) {
        await prisma.medication.createMany({
          data: dto.medications.map((med) => ({
            drugId: med.drugId,
            prescriptionId: prescription.id,
            dosePerIntake: med.dosePerIntake,
            timesPerDay: med.timesPerDay,
            totalDays: med.totalDays,
            instructions: med.instructions,
          })),
        });
      }

      // Create test recommendation
      const testRecommendation = await prisma.checkupTestRecommendation.create({
        data: {
          additionalTests: dto.additionalTests,
        },
      });

      // Create recommended lab tests if any
      if (dto.recommendedLabTestIds && dto.recommendedLabTestIds.length > 0) {
        await prisma.recommendedLabTest.createMany({
          data: dto.recommendedLabTestIds.map((labTestId) => ({
            testRecommendationId: testRecommendation.id,
            labTestId,
          })),
        });
      }

      // Create draft checkup
      return prisma.checkup.create({
        data: {
          appointmentId: dto.appointmentId,
          bloodPressure: dto.bloodPressure,
          temperature: dto.temperature,
          heartRate: dto.heartRate,
          bloodSugar: dto.bloodSugar,
          symptoms: dto.symptoms || '',
          diagnosis: dto.diagnosis || '',
          notes: dto.notes,
          isDraft: true,
          prescriptionId: prescription.id,
          checkupTestRecommendationId: testRecommendation.id,
        },
      });
    });

    return this.getCheckupById(checkup.id, userId);
  }

  private async updateDraft(
    existingCheckup: { id: number; prescriptionId: number; checkupTestRecommendationId: number },
    dto: SaveDraftDto,
    userId: number,
  ): Promise<CheckupResponseDto> {
    await this.prisma.$transaction(async (prisma) => {
      // Update checkup fields
      await prisma.checkup.update({
        where: { id: existingCheckup.id },
        data: {
          bloodPressure: dto.bloodPressure,
          temperature: dto.temperature,
          heartRate: dto.heartRate,
          bloodSugar: dto.bloodSugar,
          symptoms: dto.symptoms || '',
          diagnosis: dto.diagnosis || '',
          notes: dto.notes,
        },
      });

      // Update prescription
      await prisma.prescription.update({
        where: { id: existingCheckup.prescriptionId },
        data: {
          additionalMedications: dto.additionalMedications,
        },
      });

      // Delete existing medications and recreate
      await prisma.medication.deleteMany({
        where: { prescriptionId: existingCheckup.prescriptionId },
      });

      if (dto.medications && dto.medications.length > 0) {
        await prisma.medication.createMany({
          data: dto.medications.map((med) => ({
            drugId: med.drugId,
            prescriptionId: existingCheckup.prescriptionId,
            dosePerIntake: med.dosePerIntake,
            timesPerDay: med.timesPerDay,
            totalDays: med.totalDays,
            instructions: med.instructions,
          })),
        });
      }

      // Update test recommendation
      await prisma.checkupTestRecommendation.update({
        where: { id: existingCheckup.checkupTestRecommendationId },
        data: {
          additionalTests: dto.additionalTests,
        },
      });

      // Delete existing recommended tests and recreate
      await prisma.recommendedLabTest.deleteMany({
        where: { testRecommendationId: existingCheckup.checkupTestRecommendationId },
      });

      if (dto.recommendedLabTestIds && dto.recommendedLabTestIds.length > 0) {
        await prisma.recommendedLabTest.createMany({
          data: dto.recommendedLabTestIds.map((labTestId) => ({
            testRecommendationId: existingCheckup.checkupTestRecommendationId,
            labTestId,
          })),
        });
      }
    });

    return this.getCheckupById(existingCheckup.id, userId);
  }

  private async createSubmittedCheckup(dto: CreateCheckupDto): Promise<number> {
    const checkup = await this.prisma.$transaction(async (prisma) => {
      // Create prescription
      const prescription = await prisma.prescription.create({
        data: {
          additionalMedications: dto.additionalMedications,
        },
      });

      // Create medications
      if (dto.medications && dto.medications.length > 0) {
        await prisma.medication.createMany({
          data: dto.medications.map((med) => ({
            drugId: med.drugId,
            prescriptionId: prescription.id,
            dosePerIntake: med.dosePerIntake,
            timesPerDay: med.timesPerDay,
            totalDays: med.totalDays,
            instructions: med.instructions,
          })),
        });
      }

      // Create test recommendation
      const testRecommendation = await prisma.checkupTestRecommendation.create({
        data: {
          additionalTests: dto.additionalTests,
        },
      });

      // Create recommended lab tests
      if (dto.recommendedLabTestIds && dto.recommendedLabTestIds.length > 0) {
        await prisma.recommendedLabTest.createMany({
          data: dto.recommendedLabTestIds.map((labTestId) => ({
            testRecommendationId: testRecommendation.id,
            labTestId,
          })),
        });
      }

      // Create submitted checkup
      return prisma.checkup.create({
        data: {
          appointmentId: dto.appointmentId,
          bloodPressure: dto.bloodPressure,
          temperature: dto.temperature,
          heartRate: dto.heartRate,
          bloodSugar: dto.bloodSugar,
          symptoms: dto.symptoms,
          diagnosis: dto.diagnosis,
          notes: dto.notes,
          isDraft: false,
          prescriptionId: prescription.id,
          checkupTestRecommendationId: testRecommendation.id,
        },
      });
    });

    return checkup.id;
  }

  private async finalizeDraft(
    checkupId: number,
    dto: CreateCheckupDto,
  ): Promise<number> {
    const existingCheckup = await this.prisma.checkup.findUnique({
      where: { id: checkupId },
      include: {
        prescription: true,
        checkupTestRecommendation: true,
      },
    });

    if (!existingCheckup) {
      throw new NotFoundException('Checkup not found');
    }

    await this.prisma.$transaction(async (prisma) => {
      // Update checkup fields and mark as submitted
      await prisma.checkup.update({
        where: { id: checkupId },
        data: {
          bloodPressure: dto.bloodPressure,
          temperature: dto.temperature,
          heartRate: dto.heartRate,
          bloodSugar: dto.bloodSugar,
          symptoms: dto.symptoms,
          diagnosis: dto.diagnosis,
          notes: dto.notes,
          isDraft: false,
        },
      });

      // Update prescription
      await prisma.prescription.update({
        where: { id: existingCheckup.prescriptionId },
        data: {
          additionalMedications: dto.additionalMedications,
        },
      });

      // Delete and recreate medications
      await prisma.medication.deleteMany({
        where: { prescriptionId: existingCheckup.prescriptionId },
      });

      if (dto.medications && dto.medications.length > 0) {
        await prisma.medication.createMany({
          data: dto.medications.map((med) => ({
            drugId: med.drugId,
            prescriptionId: existingCheckup.prescriptionId,
            dosePerIntake: med.dosePerIntake,
            timesPerDay: med.timesPerDay,
            totalDays: med.totalDays,
            instructions: med.instructions,
          })),
        });
      }

      // Update test recommendation
      await prisma.checkupTestRecommendation.update({
        where: { id: existingCheckup.checkupTestRecommendationId },
        data: {
          additionalTests: dto.additionalTests,
        },
      });

      // Delete and recreate recommended tests
      await prisma.recommendedLabTest.deleteMany({
        where: { testRecommendationId: existingCheckup.checkupTestRecommendationId },
      });

      if (dto.recommendedLabTestIds && dto.recommendedLabTestIds.length > 0) {
        await prisma.recommendedLabTest.createMany({
          data: dto.recommendedLabTestIds.map((labTestId) => ({
            testRecommendationId: existingCheckup.checkupTestRecommendationId,
            labTestId,
          })),
        });
      }
    });

    return checkupId;
  }

  private async saveAudio(
    checkupId: number,
    audioBuffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    const audioRecord = await this.prisma.checkupAudio.create({
      data: {
        checkupId,
        audioData: audioBuffer,
        mimeType,
        fileSize: audioBuffer.length,
        processingStatus: 'PENDING',
      },
    });

    // Trigger async processing - fire and forget
    void this.audioProcessingService.processAudioAsync(audioRecord.id);
    this.logger.log(`Audio saved for checkup ${checkupId}, processing started`);
  }

  private async completeAppointment(appointmentId: number): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        onlineAppointment: true,
        walkinAppointment: true,
      },
    });

    if (appointment?.onlineAppointment) {
      await this.prisma.onlineAppointment.update({
        where: { appointmentId },
        data: { status: 'COMPLETED' },
      });
    } else if (appointment?.walkinAppointment) {
      await this.prisma.walkinAppointment.update({
        where: { appointmentId },
        data: { status: 'COMPLETED' },
      });
    }
  }

  private getCheckupInclude() {
    return {
      appointment: {
        include: {
          slot: true,
          patient: {
            include: {
              user: true,
            },
          },
        },
      },
      prescription: {
        include: {
          medications: {
            include: {
              drug: true,
            },
          },
        },
      },
      checkupTestRecommendation: {
        include: {
          recommendedLabTests: {
            include: {
              labTest: true,
            },
          },
        },
      },
      audio: {
        select: {
          id: true,
          processingStatus: true,
          transcription: true,
          extractedInfo: true,
          processedAt: true,
          errorMessage: true,
        },
      },
    };
  }

  private transformToCheckupResponse(checkup: any): CheckupResponseDto {
    // Build audio info if audio exists
    const audioInfo = checkup.audio ? {
      id: checkup.audio.id,
      status: checkup.audio.processingStatus,
      transcription: checkup.audio.transcription,
      extractedInfo: checkup.audio.extractedInfo,
      processedAt: checkup.audio.processedAt,
      errorMessage: checkup.audio.errorMessage,
    } : undefined;

    return {
      id: checkup.id,
      appointmentId: checkup.appointmentId,
      bloodPressure: checkup.bloodPressure,
      temperature: checkup.temperature,
      heartRate: checkup.heartRate,
      bloodSugar: checkup.bloodSugar,
      symptoms: checkup.symptoms,
      diagnosis: checkup.diagnosis,
      notes: checkup.notes,
      insights: checkup.insights,
      gapAnalysis: checkup.gapAnalysis,
      isDraft: checkup.isDraft,
      hasAudio: !!checkup.audio,
      audioInfo,
      prescription: {
        id: checkup.prescription.id,
        additionalMedications: checkup.prescription.additionalMedications,
        medications: checkup.prescription.medications.map((med: any) => ({
          id: med.id,
          drug: {
            id: med.drug.id,
            name: med.drug.name,
            strength: med.drug.strength,
            dosageForm: med.drug.dosageForm,
            formulaName: med.drug.formulaName,
          },
          dosePerIntake: med.dosePerIntake,
          timesPerDay: med.timesPerDay,
          totalDays: med.totalDays,
          instructions: med.instructions,
        })),
      },
      checkupTestRecommendation: {
        id: checkup.checkupTestRecommendation.id,
        additionalTests: checkup.checkupTestRecommendation.additionalTests,
        recommendedLabTests:
          checkup.checkupTestRecommendation.recommendedLabTests.map(
            (test: any) => ({
              id: test.id,
              labTest: {
                id: test.labTest.id,
                name: test.labTest.name,
              },
            }),
          ),
      },
      appointment: {
        id: checkup.appointment.id,
        patientId: checkup.appointment.patientId,
        slotId: checkup.appointment.slotId,
        reason: checkup.appointment.reason,
        createdAt: checkup.appointment.createdAt,
        slot: {
          startTime: checkup.appointment.slot.startTime,
          endTime: checkup.appointment.slot.endTime,
        },
        patient: {
          id: checkup.appointment.patient.id,
          firstName: checkup.appointment.patient.user.firstName,
          lastName: checkup.appointment.patient.user.lastName || '',
          dateOfBirth: checkup.appointment.patient.dateOfBirth,
          bloodGroup: checkup.appointment.patient.bloodGroup,
          medicalHistory: checkup.appointment.patient.medicalHistory,
          allergies: checkup.appointment.patient.allergies,
        },
      },
      createdAt: checkup.createdAt,
      updatedAt: checkup.updatedAt,
    };
  }
}
