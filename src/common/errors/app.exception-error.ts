import { randomUUID } from 'crypto';
import { ErrorCode } from './error.code';
import { HttpException } from '@nestjs/common';

export interface ErrorOptions {
  cause?: unknown;
  details?: unknown;
}

export abstract class BaseError extends Error {
  readonly errorId = randomUUID();
  readonly cause?: unknown;
  readonly details?: unknown;

  static errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR;
  static status = 500;

  constructor(message: string, options?: ErrorOptions) {
    super(message);

    this.cause = options?.cause;
    this.details = options?.details;
  }
}

export class AppHttpException extends HttpException {
  constructor(status: number, payload: Record<string, unknown>) {
    super(payload, status);
  }
}
