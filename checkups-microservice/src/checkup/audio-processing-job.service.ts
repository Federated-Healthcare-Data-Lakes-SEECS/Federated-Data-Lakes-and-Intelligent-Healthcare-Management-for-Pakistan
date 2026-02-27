import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AudioProcessingService } from './audio-processing.service';

@Injectable()
export class AudioProcessingJobService implements OnModuleInit {
  private readonly logger = new Logger(AudioProcessingJobService.name);
  private isProcessing = false;

  private readonly maxRetries = 10;
  private readonly retryDelayMs = 5000;
  private readonly failedRetryAfterMinutes = 1;

  constructor(
    private prisma: PrismaService,
    private audioProcessingService: AudioProcessingService,
  ) {}

  onModuleInit() {
    this.logger.log('Audio Processing Job Service initialized');
    this.logger.log(`Max retries: ${this.maxRetries}, Retry delay: ${this.retryDelayMs}ms`);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAudioProcessingJob() {
    if (this.isProcessing) {
      this.logger.warn('Previous audio processing job still running, skipping this cycle');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting audio processing job...');

    try {
      await this.processPendingAudio();
      await this.retryFailedAudio();
      await this.handleStuckProcessing();
    } catch (error: any) {
      this.logger.error(`Audio processing job failed: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processPendingAudio(): Promise<void> {
    const pendingAudios = await this.prisma.checkupAudio.findMany({
      where: { processingStatus: 'PENDING' },
      select: { id: true, checkupId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    if (pendingAudios.length === 0) {
      this.logger.log('No pending audio records to process');
      return;
    }

    this.logger.log(`Found ${pendingAudios.length} pending audio records`);

    let successCount = 0;
    let errorCount = 0;

    for (const audio of pendingAudios) {
      try {
        this.logger.log(`Processing pending audio ${audio.id} for checkup ${audio.checkupId}`);
        await this.audioProcessingService.processAudioAsync(audio.id);
        successCount++;
        await this.delay(this.retryDelayMs);
      } catch (error: any) {
        this.logger.error(`Failed to process pending audio ${audio.id}: ${error.message}`);
        errorCount++;
      }
    }

    this.logger.log(`Pending audio processing: ${successCount} initiated, ${errorCount} errors`);
  }

  private async retryFailedAudio(): Promise<void> {
    const retryAfterDate = new Date(Date.now() - this.failedRetryAfterMinutes * 60 * 1000);

    const failedAudios = await this.prisma.checkupAudio.findMany({
      where: {
        processingStatus: 'FAILED',
        updatedAt: { lt: retryAfterDate },
      },
      select: { id: true, checkupId: true, errorMessage: true, updatedAt: true },
      orderBy: { updatedAt: 'asc' },
      take: 5,
    });

    if (failedAudios.length === 0) {
      this.logger.log('No failed audio records to retry');
      return;
    }

    this.logger.log(`Found ${failedAudios.length} failed audio records to retry`);

    let retryCount = 0;

    for (const audio of failedAudios) {
      try {
        this.logger.log(`Retrying failed audio ${audio.id} (last error: ${audio.errorMessage?.substring(0, 50)}...)`);

        await this.prisma.checkupAudio.update({
          where: { id: audio.id },
          data: { processingStatus: 'PENDING', errorMessage: null },
        });

        await this.audioProcessingService.processAudioAsync(audio.id);
        retryCount++;
        await this.delay(this.retryDelayMs);
      } catch (error: any) {
        this.logger.error(`Failed to retry audio ${audio.id}: ${error.message}`);
      }
    }

    this.logger.log(`Retried ${retryCount} failed audio records`);
  }

  private async handleStuckProcessing(): Promise<void> {
    const stuckThreshold = new Date(Date.now() - 15 * 60 * 1000);

    const stuckAudios = await this.prisma.checkupAudio.findMany({
      where: {
        processingStatus: 'PROCESSING',
        updatedAt: { lt: stuckThreshold },
      },
      select: { id: true, checkupId: true, updatedAt: true },
    });

    if (stuckAudios.length === 0) return;

    this.logger.warn(`Found ${stuckAudios.length} stuck audio records (processing > 15 min)`);

    for (const audio of stuckAudios) {
      try {
        await this.prisma.checkupAudio.update({
          where: { id: audio.id },
          data: {
            processingStatus: 'FAILED',
            errorMessage: 'Processing timed out - stuck in PROCESSING state for more than 15 minutes',
          },
        });
        this.logger.log(`Marked stuck audio ${audio.id} as FAILED for retry`);
      } catch (error: any) {
        this.logger.error(`Failed to update stuck audio ${audio.id}: ${error.message}`);
      }
    }
  }

  async triggerProcessing(checkupAudioId: number): Promise<string> {
    const audioRecord = await this.prisma.checkupAudio.findUnique({
      where: { id: checkupAudioId },
    });

    if (!audioRecord) throw new Error('Audio record not found');
    if (audioRecord.processingStatus === 'PROCESSING') throw new Error('Audio is already being processed');
    if (audioRecord.processingStatus === 'COMPLETED') throw new Error('Audio has already been processed successfully');

    await this.prisma.checkupAudio.update({
      where: { id: checkupAudioId },
      data: { processingStatus: 'PENDING', errorMessage: null },
    });

    await this.audioProcessingService.processAudioAsync(checkupAudioId);
    return 'Audio processing triggered successfully';
  }

  async getProcessingStats() {
    const [pending, processing, completed, failed] = await Promise.all([
      this.prisma.checkupAudio.count({ where: { processingStatus: 'PENDING' } }),
      this.prisma.checkupAudio.count({ where: { processingStatus: 'PROCESSING' } }),
      this.prisma.checkupAudio.count({ where: { processingStatus: 'COMPLETED' } }),
      this.prisma.checkupAudio.count({ where: { processingStatus: 'FAILED' } }),
    ]);

    return { pending, processing, completed, failed, total: pending + processing + completed + failed };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
