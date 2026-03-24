import { metrics } from '@opentelemetry/api';

export const meter = metrics.getMeter('url-shortener-api');

export const metricsRegistry = {
  total: meter.createCounter('app_operation_total'),
  success: meter.createCounter('app_operation_success'),
  error: meter.createCounter('app_operation_error'),
  retry: meter.createCounter('app_operation_retry'),
  duration: meter.createHistogram('app_operation_duration_ms'),
  operationCounter: meter.createCounter('app_operation_total'),
};

export type OperationName = 'link.create' | 'link.get' | 'link.delete';

export interface OperationContext {
  operation: OperationName;
}

export enum OperationStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  RETRY = 'retry',
  TOTAL = 'total',
}

export enum OperationErrorType {
  SYSTEM = 'system',
  BUSINESS = 'business',
}
