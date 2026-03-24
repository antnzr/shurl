import { OperationErrorType, OperationName } from './dto';

export interface IObservabilityService {
  start(operation: OperationName): number;
  success(operation: OperationName, startTime: number): void;
  error(operation: OperationName, type: OperationErrorType): void;
  retry(operation: OperationName, attempt?: number): void;
}
