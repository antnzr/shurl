import { ErrorCode } from '../constants';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../common/errors/app.exception-error';

export class LinkNotFoundError extends BaseError {
  static status = HttpStatus.NOT_FOUND;
  static errorCode = ErrorCode.LINK_NOT_FOUND;

  constructor(code: string) {
    super('Link not found', { details: { code } });
  }
}

export class LinkExpiredError extends BaseError {
  static status = HttpStatus.GONE;
  static errorCode = ErrorCode.LINK_EXPIRED;

  constructor(code: string, expiresAt: Date | string) {
    super('Link expired', { details: { code, expiresAt } });
  }
}

export class LinkCollisionError extends BaseError {
  static status = HttpStatus.CONFLICT;
  static errorCode = ErrorCode.LINK_COLLISION;

  constructor(url: string) {
    super('Link code collision', { details: { url } });
  }
}
