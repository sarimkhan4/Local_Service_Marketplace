import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true, // Strip properties without decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties present
      validationError: {
        target: false, // Don't include target object in error
        value: false,  // Don't include validated value in error
      },
    });

    if (errors.length > 0) {
      const messages = this.formatErrors(errors);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
        details: messages,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): string[] {
    return errors.map(error => {
      if (error.constraints) {
        return Object.values(error.constraints)[0];
      }
      if (error.children && error.children.length > 0) {
        return this.formatErrors(error.children)[0];
      }
      return 'Invalid value';
    });
  }
}
