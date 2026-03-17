import { ErrorCode } from '../constants';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../common/errors/app.exception-error';

export class LinkNotFoundError extends BaseError {
  static status = HttpStatus.NOT_FOUND;
  static errorCode = ErrorCode.LINK_NOT_FOUND;

  constructor(shortCode: string) {
    super('Link not found', { details: { shortCode } });
  }
}

export class LinkExpiredError extends BaseError {
  static status = HttpStatus.GONE;
  static errorCode = ErrorCode.LINK_EXPIRED;

  constructor(shortCode: string, expiresAt: Date | string) {
    super('Link expired', { details: { shortCode, expiresAt } });
  }
}
