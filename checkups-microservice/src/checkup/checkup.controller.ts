import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { CheckupService } from './checkup.service';
import { AudioProcessingService } from './audio-processing.service';
import { AudioProcessingJobService } from './audio-processing-job.service';
import { CreateCheckupDto, SaveDraftDto } from './dto';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
@Controller('checkups')
export class CheckupController {
  constructor(
    private checkupService: CheckupService,
    private audioProcessingService: AudioProcessingService,
    private audioProcessingJobService: AudioProcessingJobService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file) {
          cb(null, true);
          return;
        }
        const allowedMimes = [
          'audio/webm',
          'audio/mp3',
          'audio/mpeg',
          'audio/wav',
          'audio/ogg',
          'audio/mp4',
          'audio/aac',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid audio file format'), false);
        }
      },
    }),
  )
  submitCheckup(
    @Body() dto: CreateCheckupDto,
    @UploadedFile() audioFile: MulterFile | undefined,
    @GetUser('id') userId: number,
  ) {
    const audioBuffer = audioFile?.buffer || null;
    const audioMimeType = audioFile?.mimetype || null;
    return this.checkupService.submitCheckup(dto, audioBuffer, audioMimeType, userId);
  }

  @Post('draft')
  saveDraft(
    @Body() dto: SaveDraftDto,
    @GetUser('id') userId: number,
  ) {
    return this.checkupService.saveDraft(dto, userId);
  }

  @Get('appointment/:appointmentId')
  getCheckupByAppointment(
    @Param('appointmentId') appointmentId: string,
    @GetUser('id') userId: number,
  ) {
    return this.checkupService.getCheckupByAppointmentId(parseInt(appointmentId), userId);
  }

  @Get('history')
  getCheckupHistory(@GetUser('id') userId: number) {
    return this.checkupService.getCheckupHistory(userId);
  }

  @Get(':id')
  getCheckupById(@Param('id') id: string, @GetUser('id') userId: number) {
    return this.checkupService.getCheckupById(parseInt(id), userId);
  }

  @Get(':id/audio')
  async downloadCheckupAudio(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const audio = await this.audioProcessingService.getAudioByCheckupId(parseInt(id));

    res.set({
      'Content-Type': audio.mimeType,
      'Content-Disposition': `attachment; filename="${audio.filename}"`,
      'Content-Length': audio.fileSize,
    });

    return new StreamableFile(audio.audioData);
  }

  @Get(':id/audio/stream')
  async streamCheckupAudio(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const audio = await this.audioProcessingService.getAudioByCheckupId(parseInt(id));

    res.set({
      'Content-Type': audio.mimeType,
      'Content-Length': audio.fileSize,
    });

    return new StreamableFile(audio.audioData);
  }
}

// Admin controller for audio processing management
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/audio-processing')
export class AudioProcessingAdminController {
  constructor(
    private audioProcessingJobService: AudioProcessingJobService,
  ) {}

  @Get('stats')
  getProcessingStats() {
    return this.audioProcessingJobService.getProcessingStats();
  }

  @Post(':audioId/process')
  triggerProcessing(@Param('audioId') audioId: string) {
    return this.audioProcessingJobService.triggerProcessing(parseInt(audioId));
  }
}
