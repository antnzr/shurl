export function getField<T>(obj: unknown, ...keys: string[]): T | undefined {
  const src = obj as Record<string, unknown>;
  for (const key of keys) {
    if (key in src) return src[key] as T;
  }
  return undefined;
}
