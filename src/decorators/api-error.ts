import { ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ErrorResponse } from '../common/errors/error.response';

export function ApiError(status: number, description: string) {
  return applyDecorators(
    ApiResponse({ status, description, type: ErrorResponse }),
  );
}

export const ApiValidationError = () => ApiError(400, 'Validation error');

export const ApiLinkNotFound = () => ApiError(404, 'Link not found');

export const ApiLinkExpired = () => ApiError(410, 'Link expired');
