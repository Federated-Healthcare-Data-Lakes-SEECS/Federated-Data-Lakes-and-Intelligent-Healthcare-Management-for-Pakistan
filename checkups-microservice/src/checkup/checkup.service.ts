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

  async saveDraft(
    dto: SaveDraftDto,
    userId: number,
  ): Promise<CheckupResponseDto> {
    await this.verifyDoctorAccess(dto.appointmentId, userId, true);

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
      return this.updateDraft(existingCheckup, dto, userId);
    }

    return this.createDraft(dto, userId);
  }

  async submitCheckup(
    dto: CreateCheckupDto,
    audioBuffer: Buffer | null,
    audioMimeType: string | null,
    userId: number,
  ): Promise<CheckupResponseDto> {
    await this.verifyDoctorAccess(dto.appointmentId, userId, true);

    const existingCheckup = await this.prisma.checkup.findUnique({
      where: { appointmentId: dto.appointmentId },
    });

    if (existingCheckup && !existingCheckup.isDraft) {
      throw new BadRequestException(
        'Checkup already submitted for this appointment',
      );
    }

    if (!dto.symptoms || !dto.diagnosis) {
      throw new BadRequestException(
        'Symptoms and diagnosis are required for submission',
      );
    }

    if (dto.medications && dto.medications.length > 0) {
      const validMedications = dto.medications.filter((m) => m.drugId !== undefined && m.drugId !== null);
      dto.medications = validMedications;

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

    if (dto.recommendedLabTestIds && dto.recommendedLabTestIds.length > 0) {
      const validLabTestIds = dto.recommendedLabTestIds.filter((id) => id !== undefined && id !== null);
      dto.recommendedLabTestIds = validLabTestIds;

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
      checkupId = await this.finalizeDraft(existingCheckup.id, dto);
    } else {
      checkupId = await this.createSubmittedCheckup(dto);
    }

    if (audioBuffer && audioMimeType) {
      await this.saveAudio(checkupId, audioBuffer, audioMimeType);
    }

    await this.completeAppointment(dto.appointmentId);

    return this.getCheckupById(checkupId, userId);
  }

  async getCheckupByAppointmentId(
    appointmentId: number,
    userId: number,
  ): Promise<CheckupResponseDto | null> {
    await this.verifyDoctorAccess(appointmentId, userId, false);

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
        isDraft: false,
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
    checkCompletionStatus: boolean = false,
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

    if (checkCompletionStatus) {
      const isOnline = !!appointment.onlineAppointment;
      const appointmentStatus = isOnline
        ? appointment.onlineAppointment?.status
        : appointment.walkinAppointment?.status;

      if (appointmentStatus === 'COMPLETED') {
        throw new BadRequestException('Appointment is already completed');
      }
    }

    return { doctorId: doctor.id };
  }

  private async createDraft(
    dto: SaveDraftDto,
    userId: number,
  ): Promise<CheckupResponseDto> {
    const checkup = await this.prisma.$transaction(async (prisma) => {
      const prescription = await prisma.prescription.create({
        data: {
          additionalMedications: dto.additionalMedications,
        },
      });

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

      const testRecommendation = await prisma.checkupTestRecommendation.create({
        data: {
          additionalTests: dto.additionalTests,
        },
      });

      if (dto.recommendedLabTestIds && dto.recommendedLabTestIds.length > 0) {
        await prisma.recommendedLabTest.createMany({
          data: dto.recommendedLabTestIds.map((labTestId) => ({
            testRecommendationId: testRecommendation.id,
            labTestId,
          })),
        });
      }

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

      await prisma.prescription.update({
        where: { id: existingCheckup.prescriptionId },
        data: {
          additionalMedications: dto.additionalMedications,
        },
      });

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

      await prisma.checkupTestRecommendation.update({
        where: { id: existingCheckup.checkupTestRecommendationId },
        data: {
          additionalTests: dto.additionalTests,
        },
      });

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
      const prescription = await prisma.prescription.create({
        data: {
          additionalMedications: dto.additionalMedications,
        },
      });

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

      const testRecommendation = await prisma.checkupTestRecommendation.create({
        data: {
          additionalTests: dto.additionalTests,
        },
      });

      if (dto.recommendedLabTestIds && dto.recommendedLabTestIds.length > 0) {
        await prisma.recommendedLabTest.createMany({
          data: dto.recommendedLabTestIds.map((labTestId) => ({
            testRecommendationId: testRecommendation.id,
            labTestId,
          })),
        });
      }

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

      await prisma.prescription.update({
        where: { id: existingCheckup.prescriptionId },
        data: {
          additionalMedications: dto.additionalMedications,
        },
      });

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

      await prisma.checkupTestRecommendation.update({
        where: { id: existingCheckup.checkupTestRecommendationId },
        data: {
          additionalTests: dto.additionalTests,
        },
      });

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
          gender: checkup.appointment.patient.user.gender,
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
