import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../proxy/proxy.service';

/**
 * Proxy controller for Checkup-related routes.
 * Forwards all requests to the Checkups Microservice (port 3003).
 *
 * Proxied route prefixes:
 *   - /checkups/*
 *   - /admin/audio-processing/*
 *   - /doctorschedules/*
 *   - /appointment-slots/*
 *   - /online-appointments/*
 */

@Controller('checkups')
export class CheckupProxyController {
  private readonly targetUrl: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: ConfigService,
  ) {
    this.targetUrl = this.config.get<string>('CHECKUP_MICROSERVICE_URL') || 'http://localhost:3003';
  }

  @All()
  proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }

  @All('*path')
  proxyAll(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }
}

@Controller('admin/audio-processing')
export class AudioProcessingProxyController {
  private readonly targetUrl: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: ConfigService,
  ) {
    this.targetUrl = this.config.get<string>('CHECKUP_MICROSERVICE_URL') || 'http://localhost:3003';
  }

  @All()
  proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }

  @All('*path')
  proxyAll(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }
}

@Controller('doctorschedules')
export class DoctorScheduleProxyController {
  private readonly targetUrl: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: ConfigService,
  ) {
    this.targetUrl = this.config.get<string>('CHECKUP_MICROSERVICE_URL') || 'http://localhost:3003';
  }

  @All()
  proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }

  @All('*path')
  proxyAll(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }
}

@Controller('appointment-slots')
export class AppointmentSlotProxyController {
  private readonly targetUrl: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: ConfigService,
  ) {
    this.targetUrl = this.config.get<string>('CHECKUP_MICROSERVICE_URL') || 'http://localhost:3003';
  }

  @All()
  proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }

  @All('*path')
  proxyAll(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }
}

@Controller('online-appointments')
export class OnlineAppointmentProxyController {
  private readonly targetUrl: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: ConfigService,
  ) {
    this.targetUrl = this.config.get<string>('CHECKUP_MICROSERVICE_URL') || 'http://localhost:3003';
  }

  @All()
  proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }

  @All('*path')
  proxyAll(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, this.targetUrl);
  }
}
