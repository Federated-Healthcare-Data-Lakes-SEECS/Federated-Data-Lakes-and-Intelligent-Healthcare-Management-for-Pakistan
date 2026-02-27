import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data');

interface TranscribeResponse {
  success: boolean;
  transcription?: string;
  extracted_info?: {
    patientDemographics?: string | null;
    symptoms?: string | null;
    durationOfSymptoms?: string | null;
    medicalHistory?: string | null;
    currentMedications?: string | null;
    allergies?: string | null;
    clinicalExamination?: string | null;
    diagnosis?: string | null;
    testsOrdered?: string | null;
    prescription?: string | null;
    adviceInstructions?: string | null;
    followUpInstructions?: string | null;
  };
  gap_analysis?: string;
  error?: string;
}

@Injectable()
export class AudioProcessingService {
  private readonly logger = new Logger(AudioProcessingService.name);
  private readonly externalServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.externalServiceUrl = this.configService.get<string>(
      'AUDIO_ANALYSIS_SERVICE_URL',
      'https://injectable-laraine-nonreverentially.ngrok-free.dev/api/transcribe',
    );
  }

  async processAudioAsync(checkupAudioId: number): Promise<void> {
    this.processAudio(checkupAudioId).catch((error) => {
      this.logger.error(
        `Failed to process audio ${checkupAudioId}: ${error.message}`,
      );
    });
  }

  private async processAudio(checkupAudioId: number): Promise<void> {
    this.logger.log(`Starting audio processing for checkup audio ${checkupAudioId}`);

    try {
      await this.prisma.checkupAudio.update({
        where: { id: checkupAudioId },
        data: { processingStatus: 'PROCESSING' },
      });

      const audioRecord = await this.prisma.checkupAudio.findUnique({
        where: { id: checkupAudioId },
        include: {
          checkup: {
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
          },
        },
      });

      if (!audioRecord) {
        throw new Error(`Audio record ${checkupAudioId} not found`);
      }

      const formData = new FormData();

      formData.append('audio', Buffer.from(audioRecord.audioData), {
        filename: `checkup_${audioRecord.checkupId}.webm`,
        contentType: audioRecord.mimeType,
      });

      const checkupData = {
        checkupId: audioRecord.checkup.id,
        date: audioRecord.checkup.createdAt.toISOString().split('T')[0],
        department: audioRecord.checkup.appointment.slot.schedule.doctor.department?.name || '',
        bloodPressure: audioRecord.checkup.bloodPressure || '',
        temperature: audioRecord.checkup.temperature || '',
        heartRate: audioRecord.checkup.heartRate || '',
        bloodSugar: audioRecord.checkup.bloodSugar || '',
        symptoms: audioRecord.checkup.symptoms || '',
        diagnosis: audioRecord.checkup.diagnosis || '',
        notes: audioRecord.checkup.notes || '',
        medications: audioRecord.checkup.prescription.medications.map((med) => ({
          name: med.drug.name,
          formula: med.drug.formulaName,
          dosePerIntake: med.dosePerIntake,
          timesPerDay: med.timesPerDay,
          totalDays: med.totalDays,
          instructions: med.instructions || '',
        })),
        additionalMedications: audioRecord.checkup.prescription.additionalMedications || '',
        recommendedTests: audioRecord.checkup.checkupTestRecommendation.recommendedLabTests.map((rt) => ({
          name: rt.labTest.name,
          department: rt.labTest.department?.name || '',
        })),
        additionalTests: audioRecord.checkup.checkupTestRecommendation.additionalTests || '',
      };

      formData.append('checkup', JSON.stringify(checkupData));

      this.logger.log(`Sending audio to external service: ${this.externalServiceUrl}`);

      const response = await firstValueFrom(
        this.httpService.post<TranscribeResponse>(this.externalServiceUrl, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 1200000,
        }),
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'External service returned unsuccessful response');
      }

      const transcription = result.transcription || '';
      const extractedInfo = result.extracted_info || {};
      const gapAnalysis = result.gap_analysis || '';

      await this.prisma.$transaction([
        this.prisma.checkup.update({
          where: { id: audioRecord.checkupId },
          data: { gapAnalysis },
        }),
        this.prisma.checkupAudio.update({
          where: { id: checkupAudioId },
          data: {
            processingStatus: 'COMPLETED',
            transcription,
            extractedInfo,
            processedAt: new Date(),
          },
        }),
      ]);

      this.logger.log(`Audio processing completed for checkup ${audioRecord.checkupId}`);
    } catch (error: any) {
      this.logger.error(`Audio processing failed: ${error.message}`);

      await this.prisma.checkupAudio
        .update({
          where: { id: checkupAudioId },
          data: {
            processingStatus: 'FAILED',
            errorMessage: error.message || 'Unknown error occurred',
          },
        })
        .catch((e) => {
          this.logger.error(`Failed to update audio status: ${e.message}`);
        });
    }
  }

  async retryFailedProcessing(checkupAudioId: number): Promise<void> {
    const audioRecord = await this.prisma.checkupAudio.findUnique({
      where: { id: checkupAudioId },
    });

    if (!audioRecord) {
      throw new Error('Audio record not found');
    }

    if (audioRecord.processingStatus !== 'FAILED') {
      throw new Error('Can only retry failed processing');
    }

    await this.prisma.checkupAudio.update({
      where: { id: checkupAudioId },
      data: {
        processingStatus: 'PENDING',
        errorMessage: null,
      },
    });

    await this.processAudioAsync(checkupAudioId);
  }

  async getAudioById(checkupAudioId: number) {
    const audioRecord = await this.prisma.checkupAudio.findUnique({
      where: { id: checkupAudioId },
      select: {
        audioData: true,
        mimeType: true,
        fileSize: true,
        checkupId: true,
      },
    });

    if (!audioRecord) {
      throw new Error('Audio record not found');
    }

    const extensionMap: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/mp3': 'mp3',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/m4a': 'm4a',
      'audio/mp4': 'm4a',
      'audio/ogg': 'ogg',
    };
    const extension = extensionMap[audioRecord.mimeType] || 'webm';

    return {
      audioData: Buffer.from(audioRecord.audioData),
      mimeType: audioRecord.mimeType,
      fileSize: audioRecord.fileSize,
      filename: `checkup_${audioRecord.checkupId}_audio.${extension}`,
    };
  }

  async getAudioByCheckupId(checkupId: number) {
    const audioRecord = await this.prisma.checkupAudio.findUnique({
      where: { checkupId },
      select: {
        audioData: true,
        mimeType: true,
        fileSize: true,
        checkupId: true,
      },
    });

    if (!audioRecord) {
      throw new Error('Audio record not found for this checkup');
    }

    const extensionMap: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/mp3': 'mp3',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/m4a': 'm4a',
      'audio/mp4': 'm4a',
      'audio/ogg': 'ogg',
    };
    const extension = extensionMap[audioRecord.mimeType] || 'webm';

    return {
      audioData: Buffer.from(audioRecord.audioData),
      mimeType: audioRecord.mimeType,
      fileSize: audioRecord.fileSize,
      filename: `checkup_${audioRecord.checkupId}_audio.${extension}`,
    };
  }
}
