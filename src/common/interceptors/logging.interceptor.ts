import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, headers, ip } = request;
    const userAgent = headers['user-agent'];
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `${method} ${url} | Status: ${response.statusCode} | Duration: ${duration}ms | IP: ${ip} | Agent: ${userAgent}`,
        );
      }),
      catchError((err) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `${method} ${url} | Status: ${response.statusCode} | Duration: ${duration}ms | Error: ${err.message}`,
        );
        return throwError(() => err);
      }),
    );
  }
}
