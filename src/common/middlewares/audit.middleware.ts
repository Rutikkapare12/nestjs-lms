import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuditMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, path, ip } = req;
    const userAgent = req.get('user-agent');

    // Store audit context
    req['auditContext'] = {
      ipAddress: ip,
      userAgent,
      timestamp: new Date(),
      method,
      path,
    };

    // Log response after it's sent
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.debug(
        `${method} ${path} - ${res.statusCode} - ${duration}ms - IP: ${ip}`,
      );
    });

    next();
  }
}
