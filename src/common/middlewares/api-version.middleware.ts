import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiVersion = req.path.split('/')[1];
    req['apiVersion'] = apiVersion || 'v1';
    res.setHeader('X-API-Version', req['apiVersion']);
    next();
  }
}
