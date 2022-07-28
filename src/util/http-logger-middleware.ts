import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MainLogger } from './logger';

export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = new MainLogger('HttpLogger');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.http(`${method} ${statusCode} - ${originalUrl}`, {
        ip, method, originalUrl, userAgent, statusCode,
      });
    });
    next();
  }
}
