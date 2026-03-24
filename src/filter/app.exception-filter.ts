import {
  Catch,
  Logger,
  HttpStatus,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ErrorCode } from '../common/errors/error.code';
import { OperationErrorType } from '../observability/dto';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { BaseError } from '../common/errors/app.exception-error';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const req = ctx.getRequest<FastifyRequest>();
    const res = ctx.getResponse<FastifyReply>();

    const span = trace.getActiveSpan();

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
    }

    const err =
      exception instanceof Error
        ? {
            name: exception.name,
            message: exception.message,
            stack: exception.stack,
          }
        : {
            name: 'UnknownError',
            message: String(exception),
          };

    if (span) {
      span.recordException(err);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message,
      });

      span.setAttributes({
        'app.error_code': errorCode,
        'http.status_code': status,
      });

      span.setAttribute(
        'app.error_type',
        exception instanceof BaseError
          ? OperationErrorType.BUSINESS
          : OperationErrorType.SYSTEM,
      );

      if (errorId) {
        span.setAttribute('app.error_id', errorId);
      }
    }

    this.logger.error({
      err,
      errorId,
      details,
      errorCode,
      path: req.url,
      requestId: req.id,
      statusCode: status,
    });

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
