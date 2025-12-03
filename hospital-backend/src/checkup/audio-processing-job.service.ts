import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AudioProcessingService } from './audio-processing.service';

@Injectable()
export class AudioProcessingJobService implements OnModuleInit {
  private readonly logger = new Logger(AudioProcessingJobService.name);
  private isProcessing = false;

  // Configuration
  private readonly maxRetries = 3; // Maximum retry attempts before giving up
  private readonly retryDelayMs = 5000; // 5 seconds between retries in same batch
  private readonly failedRetryAfterMinutes = 10; // Retry failed items after 10 minutes

  constructor(
    private prisma: PrismaService,
    private audioProcessingService: AudioProcessingService,
  ) {}

  onModuleInit() {
    this.logger.log('Audio Processing Job Service initialized');
    this.logger.log(`Max retries: ${this.maxRetries}, Retry delay: ${this.retryDelayMs}ms`);
  }

  /**
   * Run every 5 minutes to process pending and retry failed audio
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAudioProcessingJob() {
    if (this.isProcessing) {
      this.logger.warn('Previous audio processing job still running, skipping this cycle');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting audio processing job...');

    try {
      // 1. Process PENDING audio records
      await this.processPendingAudio();

      // 2. Retry FAILED audio records (that haven't exceeded max retries)
      await this.retryFailedAudio();

      // 3. Check for stuck PROCESSING records (processing for > 15 minutes)
      await this.handleStuckProcessing();

    } catch (error: any) {
      this.logger.error(`Audio processing job failed: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process all PENDING audio records
   */
  private async processPendingAudio(): Promise<void> {
    const pendingAudios = await this.prisma.checkupAudio.findMany({
      where: {
        processingStatus: 'PENDING',
      },
      select: {
        id: true,
        checkupId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc', // Process oldest first
      },
      take: 10, // Process max 10 per cycle to avoid overwhelming the service
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
        
        // Call the audio processing service (this will update status internally)
        await this.audioProcessingService.processAudioAsync(audio.id);
        successCount++;

        // Add delay between processing to avoid overwhelming external service
        await this.delay(this.retryDelayMs);
      } catch (error: any) {
        this.logger.error(`Failed to process pending audio ${audio.id}: ${error.message}`);
        errorCount++;
      }
    }

    this.logger.log(`Pending audio processing: ${successCount} initiated, ${errorCount} errors`);
  }

  /**
   * Retry FAILED audio records that:
   * - Haven't exceeded max retries
   * - Failed more than X minutes ago (to avoid immediate retry loops)
   */
  private async retryFailedAudio(): Promise<void> {
    const retryAfterDate = new Date(Date.now() - this.failedRetryAfterMinutes * 60 * 1000);

    const failedAudios = await this.prisma.checkupAudio.findMany({
      where: {
        processingStatus: 'FAILED',
        updatedAt: {
          lt: retryAfterDate, // Only retry if failed more than X minutes ago
        },
      },
      select: {
        id: true,
        checkupId: true,
        errorMessage: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'asc', // Retry oldest failures first
      },
      take: 5, // Retry max 5 per cycle
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

        // Reset status to PENDING and trigger reprocessing
        await this.prisma.checkupAudio.update({
          where: { id: audio.id },
          data: {
            processingStatus: 'PENDING',
            errorMessage: null,
          },
        });

        // Trigger async processing
        await this.audioProcessingService.processAudioAsync(audio.id);
        retryCount++;

        // Add delay between retries
        await this.delay(this.retryDelayMs);
      } catch (error: any) {
        this.logger.error(`Failed to retry audio ${audio.id}: ${error.message}`);
      }
    }

    this.logger.log(`Retried ${retryCount} failed audio records`);
  }

  /**
   * Handle audio records stuck in PROCESSING state for too long
   * This can happen if the server crashed during processing
   */
  private async handleStuckProcessing(): Promise<void> {
    const stuckThreshold = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes

    const stuckAudios = await this.prisma.checkupAudio.findMany({
      where: {
        processingStatus: 'PROCESSING',
        updatedAt: {
          lt: stuckThreshold,
        },
      },
      select: {
        id: true,
        checkupId: true,
        updatedAt: true,
      },
    });

    if (stuckAudios.length === 0) {
      return;
    }

    this.logger.warn(`Found ${stuckAudios.length} stuck audio records (processing > 15 min)`);

    for (const audio of stuckAudios) {
      try {
        // Mark as FAILED so it can be retried
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

  /**
   * Manually trigger processing for a specific audio record
   */
  async triggerProcessing(checkupAudioId: number): Promise<string> {
    const audioRecord = await this.prisma.checkupAudio.findUnique({
      where: { id: checkupAudioId },
    });

    if (!audioRecord) {
      throw new Error('Audio record not found');
    }

    if (audioRecord.processingStatus === 'PROCESSING') {
      throw new Error('Audio is already being processed');
    }

    if (audioRecord.processingStatus === 'COMPLETED') {
      throw new Error('Audio has already been processed successfully');
    }

    // Reset status and trigger processing
    await this.prisma.checkupAudio.update({
      where: { id: checkupAudioId },
      data: {
        processingStatus: 'PENDING',
        errorMessage: null,
      },
    });

    await this.audioProcessingService.processAudioAsync(checkupAudioId);

    return 'Audio processing triggered successfully';
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const [pending, processing, completed, failed] = await Promise.all([
      this.prisma.checkupAudio.count({ where: { processingStatus: 'PENDING' } }),
      this.prisma.checkupAudio.count({ where: { processingStatus: 'PROCESSING' } }),
      this.prisma.checkupAudio.count({ where: { processingStatus: 'COMPLETED' } }),
      this.prisma.checkupAudio.count({ where: { processingStatus: 'FAILED' } }),
    ]);

    return {
      pending,
      processing,
      completed,
      failed,
      total: pending + processing + completed + failed,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
