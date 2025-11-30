import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MedicalHistoryJobService implements OnModuleInit {
  private readonly logger = new Logger(MedicalHistoryJobService.name);
  private readonly medicalHistoryServiceUrl: string;
  private isProcessing = false;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    // API 4: POST /api/summarize-history endpoint
    this.medicalHistoryServiceUrl = this.configService.get<string>(
      'MEDICAL_HISTORY_SERVICE_URL',
      'https://injectable-laraine-nonreverentially.ngrok-free.dev/api/summarize-history',
    );
  }

  onModuleInit() {
    this.logger.log('Medical History Job Service initialized');
    this.logger.log(`Service URL: ${this.medicalHistoryServiceUrl}`);
  }

  /**
   * Run every 5 minutes to update patient medical histories
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleMedicalHistoryUpdate() {
    if (this.isProcessing) {
      this.logger.warn('Previous job still running, skipping this cycle');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting medical history update job...');

    try {
      // Get all patients who have at least one completed checkup
      const patients = await this.prisma.patient.findMany({
        where: {
          appointments: {
            some: {
              checkup: {
                isDraft: false,
              },
            },
          },
        },
        include: {
          user: true,
        },
      });

      this.logger.log(`Found ${patients.length} patients with checkup history`);

      let successCount = 0;
      let errorCount = 0;

      for (const patient of patients) {
        try {
          await this.updatePatientMedicalHistory(patient);
          successCount++;
        } catch (error: any) {
          this.logger.error(
            `Failed to update history for patient ${patient.id}: ${error.message}`,
          );
          errorCount++;
        }

        // Small delay to avoid overwhelming the external service
        await this.delay(100);
      }

      this.logger.log(
        `Medical history update completed: ${successCount} success, ${errorCount} errors`,
      );
    } catch (error: any) {
      this.logger.error(`Medical history job failed: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Update medical history for a single patient
   */
  async updatePatientMedicalHistory(patient: any): Promise<void> {
    // Fetch all completed checkups for this patient
    const checkups = await this.prisma.checkup.findMany({
      where: {
        isDraft: false,
        appointment: {
          patientId: patient.id,
        },
      },
      include: {
        appointment: {
          include: {
            slot: {
              include: {
                schedule: {
                  include: {
                    doctor: {
                      include: {
                        department: true,
                      },
                    },
                  },
                },
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
                labTest: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (checkups.length === 0) {
      return; // No checkups to process
    }

    // Calculate age from date of birth
    const age = patient.dateOfBirth
      ? Math.floor(
          (Date.now() - new Date(patient.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        )
      : null;

    // Build the request payload
    const payload = {
      patient: {
        name: `${patient.user.firstName} ${patient.user.lastName || ''}`.trim(),
        gender: patient.user.gender,
        age: age,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        medicalHistory: patient.medicalHistory,
        familyHistory: patient.familyHistory,
      },
      checkups: checkups.map((checkup) => ({
        checkupId: checkup.id,
        date: checkup.createdAt.toISOString().split('T')[0],
        department:
          checkup.appointment.slot.schedule.doctor.department?.name || '',
        bloodPressure: checkup.bloodPressure,
        temperature: checkup.temperature,
        heartRate: checkup.heartRate,
        bloodSugar: checkup.bloodSugar,
        symptoms: checkup.symptoms,
        diagnosis: checkup.diagnosis,
        notes: checkup.notes,
        medications: checkup.prescription.medications.map((med) => ({
          name: med.drug.name,
          formula: med.drug.formulaName,
          dosePerIntake: med.dosePerIntake,
          timesPerDay: med.timesPerDay,
          totalDays: med.totalDays,
          instructions: med.instructions,
        })),
        additionalMedications: checkup.prescription.additionalMedications,
        recommendedTests:
          checkup.checkupTestRecommendation.recommendedLabTests.map((rt) => ({
            name: rt.labTest.name,
            department: rt.labTest.department?.name || '',
          })),
        additionalTests: checkup.checkupTestRecommendation.additionalTests,
      })),
    };

    // Call external service (API 4: POST /api/summarize-history)
    const response = await firstValueFrom(
      this.httpService.post(this.medicalHistoryServiceUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 600000, // 10 minute timeout (API 4 takes ~30-60 seconds)
      }),
    );

    // Response format: { success: true, summary: "..." }
    const result = response.data;
    
    if (!result?.success) {
      throw new Error(result?.error || 'External service returned unsuccessful response');
    }

    const medicalHistory = result.summary;

    if (medicalHistory) {
      // Update patient's medical history
      await this.prisma.patient.update({
        where: { id: patient.id },
        data: { medicalHistory },
      });

      this.logger.log(`Updated medical history for patient ${patient.id}`);
    }
  }

  /**
   * Manually trigger medical history update for a specific patient
   */
  async triggerUpdateForPatient(patientId: number): Promise<string> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    await this.updatePatientMedicalHistory(patient);
    return 'Medical history updated successfully';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
