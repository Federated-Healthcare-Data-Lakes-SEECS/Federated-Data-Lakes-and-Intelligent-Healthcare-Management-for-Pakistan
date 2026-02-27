import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../proxy/proxy.service';

/**
 * Proxy controller for Lab Test-related routes.
 * Forwards all requests to the Lab Tests Microservice (port 3004).
 *
 * Proxied route prefixes:
 *   - /labtests/*
 *   - /labtesttemplate/*
 *   - /patient-lab-tests/*
 */

@Controller('labtests')
export class LabTestProxyController {
  private readonly targetUrl: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: ConfigService,
  ) {
    this.targetUrl = this.config.get<string>('LABTEST_MICROSERVICE_URL') || 'http://localhost:3004';
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

@Controller('labtesttemplate')
export class LabTestTemplateProxyController {
  private readonly targetUrl: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: ConfigService,
  ) {
    this.targetUrl = this.config.get<string>('LABTEST_MICROSERVICE_URL') || 'http://localhost:3004';
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

@Controller('patient-lab-tests')
export class PatientLabTestProxyController {
  private readonly targetUrl: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: ConfigService,
  ) {
    this.targetUrl = this.config.get<string>('LABTEST_MICROSERVICE_URL') || 'http://localhost:3004';
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
