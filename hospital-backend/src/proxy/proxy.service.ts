import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosError, Method } from 'axios';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Forward a request to a microservice, preserving method, path, query, body, and auth headers.
   */
  async forward(
    req: Request,
    res: Response,
    targetBaseUrl: string,
  ): Promise<void> {
    const targetUrl = `${targetBaseUrl}${req.originalUrl}`;
    const method = req.method.toLowerCase() as Method;

    this.logger.debug(`Proxying ${method.toUpperCase()} ${req.originalUrl} -> ${targetUrl}`);

    const headers: Record<string, string> = {};

    // Forward authorization header
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Forward content-type for non-GET requests
    const incomingContentType = req.headers['content-type'];
    if (incomingContentType) {
      headers['Content-Type'] = incomingContentType;
    }

    const config: AxiosRequestConfig = {
      url: targetUrl,
      method,
      headers,
      validateStatus: () => true,
      responseType: 'arraybuffer',
    };

    // Forward body for non-GET requests
    if (['post', 'put', 'patch', 'delete'].includes(method) && req.body) {
      // For multipart requests, forward the raw body
      if (incomingContentType && incomingContentType.includes('multipart/form-data')) {
        // The raw body won't work with parsed multipart; we need to re-stream
        // For file uploads, the gateway controller will handle this specially
        config.data = req.body;
      } else {
        config.data = req.body;
      }
    }

    try {
      const response = await firstValueFrom(
        this.httpService.request(config),
      );

      const responseContentType: string = String(response.headers['content-type'] || '');
      res.status(response.status);

      // Forward relevant response headers
      if (response.headers['content-type']) {
        res.setHeader('Content-Type', String(response.headers['content-type']));
      }
      if (response.headers['content-disposition']) {
        res.setHeader('Content-Disposition', String(response.headers['content-disposition']));
      }
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', String(response.headers['content-length']));
      }

      // If JSON, parse and send as JSON
      if (responseContentType.includes('application/json')) {
        const text = Buffer.from(response.data as ArrayBuffer).toString('utf8');
        try {
          res.json(JSON.parse(text));
        } catch {
          res.send(text);
        }
        return;
      }

      // For binary (audio, files), send raw buffer
      res.send(Buffer.from(response.data as ArrayBuffer));
    } catch (err: unknown) {
      const error = err as AxiosError;
      this.logger.error(
        `Proxy error for ${method.toUpperCase()} ${targetUrl}: ${error.message}`,
      );

      if (error.response) {
        throw new HttpException(
          String(error.response.data) || 'Microservice error',
          typeof error.response.status === 'number' ? error.response.status : 500,
        );
      }

      throw new HttpException('Microservice unavailable', 503);
    }
  }
}
