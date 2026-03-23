import { PGErrorCode } from './error.code';

export function isPgUniqueViolationError(
  err: unknown,
): err is { code: PGErrorCode } {
  if (typeof err !== 'object' || err === null) return false;

  const maybeCode = (err as { code: unknown }).code;
  return Object.values(PGErrorCode).includes(maybeCode as PGErrorCode);
}
