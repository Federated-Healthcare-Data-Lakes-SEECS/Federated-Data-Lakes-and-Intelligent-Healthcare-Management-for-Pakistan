import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosError, Method } from 'axios';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Forward a request to a microservice, preserving method, path, query, body, and auth headers.
   * For multipart/form-data requests, uses the raw body to preserve file boundaries.
   */
  async forward(
    req: Request,
    res: Response,
    targetBaseUrl: string,
  ): Promise<void> {
    const targetUrl = `${targetBaseUrl}${req.originalUrl}`;
    const method = req.method.toLowerCase() as Method;
    const incomingContentType = req.headers['content-type'];
    const isMultipart = incomingContentType && incomingContentType.includes('multipart/form-data');

    this.logger.log(`[PROXY] ${method.toUpperCase()} ${req.originalUrl} -> ${targetUrl}${isMultipart ? ' (multipart)' : ''}`);

    // For multipart requests, use raw HTTP proxy to preserve the stream/boundaries
    if (isMultipart && ['post', 'put', 'patch'].includes(method)) {
      return this.forwardMultipart(req, res, targetUrl);
    }

    const headers: Record<string, string> = {};

    // Forward authorization header
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Forward content-type for non-GET requests
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
      config.data = req.body;
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

  /**
   * Forward multipart/form-data requests by piping the raw request to the microservice.
   * This preserves the multipart boundaries and file data intact.
   */
  private forwardMultipart(
    req: Request,
    res: Response,
    targetUrl: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const parsed = new URL(targetUrl);
      const isHttps = parsed.protocol === 'https:';
      const transport = isHttps ? https : http;

      const headers: Record<string, string> = {};

      // Forward content-type (includes boundary) — this is critical for multipart
      if (req.headers['content-type']) {
        headers['content-type'] = req.headers['content-type'];
      }

      // Forward authorization header
      if (req.headers.authorization) {
        headers['authorization'] = req.headers.authorization;
      }

      // Forward content-length if available
      if (req.headers['content-length']) {
        headers['content-length'] = req.headers['content-length'];
      }

      const proxyReq = transport.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (isHttps ? 443 : 80),
          path: parsed.pathname + parsed.search,
          method: req.method,
          headers,
        },
        (proxyRes) => {
          res.status(proxyRes.statusCode || 500);

          // Forward response headers
          if (proxyRes.headers['content-type']) {
            res.setHeader('Content-Type', String(proxyRes.headers['content-type']));
          }
          if (proxyRes.headers['content-disposition']) {
            res.setHeader('Content-Disposition', String(proxyRes.headers['content-disposition']));
          }

          const chunks: Buffer[] = [];
          proxyRes.on('data', (chunk: Buffer) => chunks.push(chunk));
          proxyRes.on('end', () => {
            const body = Buffer.concat(chunks);
            const responseContentType = String(proxyRes.headers['content-type'] || '');

            if (responseContentType.includes('application/json')) {
              const text = body.toString('utf8');
              try {
                res.json(JSON.parse(text));
              } catch {
                res.send(text);
              }
            } else {
              res.send(body);
            }
            resolve();
          });
          proxyRes.on('error', (err) => {
            this.logger.error(`Proxy multipart response error: ${err.message}`);
            reject(new HttpException('Microservice error', 502));
          });
        },
      );

      proxyReq.on('error', (err) => {
        this.logger.error(`Proxy multipart request error: ${err.message}`);
        reject(new HttpException('Microservice unavailable', 503));
      });

      // Use rawBody if available (NestJS rawBody option), otherwise pipe the request stream
      const rawBody = (req as any).rawBody;
      if (rawBody) {
        proxyReq.end(rawBody);
      } else {
        req.pipe(proxyReq);
      }
    });
  }
}
