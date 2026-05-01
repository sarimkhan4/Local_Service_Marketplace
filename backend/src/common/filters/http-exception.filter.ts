import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: string[];
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred. Please try again later.';
    let error = 'Internal Server Error';
    let details: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        
        // Handle validation errors
        if (responseObj.message) {
          if (Array.isArray(responseObj.message)) {
            details = responseObj.message;
            message = 'Validation failed. Please check your input.';
          } else {
            message = responseObj.message;
          }
        }
        
        error = responseObj.error || error;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      // Log the actual error for debugging but don't expose it to the client
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    // Map status codes to user-friendly messages
    message = this.getUserFriendlyMessage(status, message);

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log the error (but sanitize in production)
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }

  private getUserFriendlyMessage(status: number, originalMessage: string): string {
    const messages: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'The request was invalid. Please check your input and try again.',
      [HttpStatus.UNAUTHORIZED]: 'Please log in to access this resource.',
      [HttpStatus.FORBIDDEN]: 'You do not have permission to perform this action.',
      [HttpStatus.NOT_FOUND]: 'The requested resource was not found.',
      [HttpStatus.CONFLICT]: 'This operation could not be completed due to a conflict.',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'We could not process your request. Please check your data.',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too many requests. Please wait a moment and try again.',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again later.',
    };

    return messages[status] || originalMessage;
  }
}
