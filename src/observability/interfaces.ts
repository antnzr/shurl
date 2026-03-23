import { OperationName } from './dto';

export interface IObservabilityService {
  start(operation: OperationName): number;
  success(operation: OperationName, startTime: number): void;
  error(operation: OperationName): void;
  retry(operation: OperationName): void;
}
