import {
  OperationName,
  metricsRegistry,
  OperationStatus,
  OperationErrorType,
} from './dto';
import { Injectable } from '@nestjs/common';
import { IObservabilityService } from './interfaces';
import { SpanStatusCode, trace } from '@opentelemetry/api';

@Injectable()
export class ObservabilityService implements IObservabilityService {
  start(operation: OperationName): number {
    const span = trace.getActiveSpan();

    if (span) {
      span.setAttribute('app.operation', operation);
    }

    metricsRegistry.operationCounter.add(1, {
      operation,
      status: OperationStatus.TOTAL,
    });

    return performance.now();
  }

  success(operation: OperationName, startTime: number): void {
    const span = trace.getActiveSpan();

    metricsRegistry.operationCounter.add(1, {
      operation,
      status: OperationStatus.SUCCESS,
    });

    metricsRegistry.duration.record(performance.now() - startTime, {
      operation,
    });

    if (span) {
      span.setAttribute('app.success', true);
    }
  }

  error(operation: OperationName, type: OperationErrorType): void {
    const span = trace.getActiveSpan();

    metricsRegistry.operationCounter.add(1, {
      operation,
      error_type: type,
      status: OperationStatus.ERROR,
    });

    if (span) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.setAttributes({
        'app.error': true,
        'app.error_type': type,
      });
    }
  }

  retry(operation: OperationName, attempt?: number): void {
    const span = trace.getActiveSpan();

    metricsRegistry.operationCounter.add(1, {
      operation,
      status: OperationStatus.RETRY,
    });

    if (span) {
      span.addEvent('retry', {
        operation,
        ...(attempt !== undefined && { attempt }),
      });
    }
  }
}
