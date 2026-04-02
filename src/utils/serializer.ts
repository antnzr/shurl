import { Logger } from '@nestjs/common';

const logger = new Logger('JsonSerializer');

export class JsonSerializer {
  static serialize<T>(value: T): string | null {
    try {
      return JSON.stringify(value);
    } catch (err: unknown) {
      logger.error({ msg: 'JSON serialization failed', err });
      return null;
    }
  }

  static deserialize<T>(raw: string): T | null {
    try {
      return JSON.parse(raw) as T;
    } catch (err: unknown) {
      logger.error({ msg: 'JSON deserialization failed', err });
      return null;
    }
  }
}
