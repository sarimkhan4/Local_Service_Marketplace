import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom Business Logic Error
 * Thrown when a business rule is violated
 */
export class BusinessLogicException extends HttpException {
  constructor(message: string, errorCode: string = 'BUSINESS_ERROR') {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message,
        errorCode,
        error: 'Business Logic Error',
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

/**
 * Resource Not Found Error
 * Thrown when a requested resource doesn't exist
 */
export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' was not found`
      : `${resource} was not found`;
    
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        errorCode: 'RESOURCE_NOT_FOUND',
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Duplicate Resource Error
 * Thrown when trying to create a resource that already exists
 */
export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `A ${resource} with this ${field} already exists`,
        errorCode: 'DUPLICATE_RESOURCE',
        error: 'Conflict',
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Authentication Error
 * Thrown when authentication fails
 */
export class AuthenticationException extends HttpException {
  constructor(message: string = 'Invalid credentials') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        errorCode: 'AUTHENTICATION_FAILED',
        error: 'Unauthorized',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Authorization Error
 * Thrown when user doesn't have required permissions
 */
export class AuthorizationException extends HttpException {
  constructor(message: string = 'Access denied') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        errorCode: 'ACCESS_DENIED',
        error: 'Forbidden',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Invalid Operation Error
 * Thrown when an operation cannot be performed in the current state
 */
export class InvalidOperationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errorCode: 'INVALID_OPERATION',
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Validation Error with Field Information
 */
export interface FieldError {
  field: string;
  message: string;
  value?: any;
}

export class ValidationException extends HttpException {
  constructor(fieldErrors: FieldError[]) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        error: 'Unprocessable Entity',
        fieldErrors,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
