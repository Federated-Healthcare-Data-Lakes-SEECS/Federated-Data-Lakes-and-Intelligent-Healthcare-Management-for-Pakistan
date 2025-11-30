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
  ) {}

  /**
   * Submit checkup (final submission) - completes the appointment
   * Supports optional audio file upload
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
      },
      fileFilter: (req, file, cb) => {
        if (!file) {
          cb(null, true);
          return;
        }
        // Accept common audio formats
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
    console.log('[Checkup Controller] Submit checkup request received');
    console.log('[Checkup Controller] Audio file:', audioFile ? `${(audioFile.size / 1024).toFixed(2)} KB, type: ${audioFile.mimetype}` : 'No audio');
    const audioBuffer = audioFile?.buffer || null;
    const audioMimeType = audioFile?.mimetype || null;
    return this.checkupService.submitCheckup(dto, audioBuffer, audioMimeType, userId);
  }

  /**
   * Save checkup as draft - does not complete appointment
   * Audio is not accepted for drafts
   */
  @Post('draft')
  saveDraft(
    @Body() dto: SaveDraftDto,
    @GetUser('id') userId: number,
  ) {
    return this.checkupService.saveDraft(dto, userId);
  }

  /**
   * Get checkup for a specific appointment (returns draft or completed)
   */
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

  /**
   * Download audio file for a specific checkup
   * Returns the audio as a downloadable file
   */
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

  /**
   * Stream audio file for a specific checkup (for playback in browser)
   */
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
