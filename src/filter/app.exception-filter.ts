import {
  Catch,
  Logger,
  HttpStatus,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorCode } from '../common/errors/error.code';
import { BaseError } from '../common/errors/app.exception-error';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const req = ctx.getRequest<FastifyRequest>();
    const res = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.INTERNAL_ERROR;
    let message = 'Internal server error';
    let details: unknown;
    let errorId: string | undefined;

    if (exception instanceof BaseError) {
      const errorClass = exception.constructor as typeof BaseError;

      status = errorClass.status;
      errorCode = errorClass.errorCode;
      message = exception.message;
      details = exception.details;
      errorId = exception.errorId;

      this.logger.error({
        message,
        details,
        errorId,
        errorCode,
        path: req.url,
        requestId: req.id,
        stack: exception.stack,
      });
    } else {
      this.logger.error({
        path: req.url,
        error: exception,
        requestId: req.id,
        message: 'Unhandled exception',
      });
    }

    res.status(status).send({
      message,
      details,
      errorId,
      errorCode,
      path: req.url,
      requestId: req.id,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
