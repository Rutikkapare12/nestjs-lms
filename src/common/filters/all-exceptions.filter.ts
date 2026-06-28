import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../dto/response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorResponse: any = null;
    let details: Record<string, any> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).error;
        errorResponse = exceptionResponse;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error('Unknown error:', exception);
    }

    // Validation error handling
    if (
      status === HttpStatus.BAD_REQUEST &&
      errorResponse?.message?.length > 0
    ) {
      details = this.formatValidationErrors(errorResponse.message);
    }

    const errorResponse_final: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
      error: this.getErrorType(status),
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details }),
    };

    response.status(status).json(errorResponse_final);
  }

  private getErrorType(status: number): string {
    const errorMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Validation Error',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };
    return errorMap[status] || 'Error';
  }

  private formatValidationErrors(errors: any[]): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};
    if (Array.isArray(errors)) {
      errors.forEach((error) => {
        const field = error.property;
        const constraints = Object.values(error.constraints || {});
        formatted[field] = constraints as string[];
      });
    }
    return formatted;
  }
}
