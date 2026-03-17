import { ErrorCode } from './error.code';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from './app.exception-error';
import { ValidationError as _ValidationError } from 'class-validator';

export interface ValidationFieldError {
  field: string;
  errors: string[];
}

export class ValidationError extends BaseError {
  static status = HttpStatus.BAD_REQUEST;
  static errorCode = ErrorCode.VALIDATION_ERROR;

  constructor(fields: ValidationFieldError[]) {
    super('Validation failed', { details: { fields } });
  }
}

export function flattenValidationErrors(
  errors: _ValidationError[],
  parentPath = '',
): ValidationFieldError[] {
  const result: ValidationFieldError[] = [];

  for (const error of errors) {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      result.push({
        field: fieldPath,
        errors: Object.values(error.constraints),
      });
    }

    if (error.children?.length) {
      result.push(...flattenValidationErrors(error.children, fieldPath));
    }
  }

  return result;
}
