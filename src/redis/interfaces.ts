export interface CacheSetOptions {
  ttlSeconds?: number;
}

export interface ICacheService {
  get<TData>(namespace: string, key: string): Promise<TData | null>;
  getOrSet<T>(
    namespace: string,
    key: string,
    factory: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<T>;
  set<TData>(
    namespace: string,
    key: string,
    value: TData,
    options?: CacheSetOptions,
  ): Promise<void>;
  delete(namespace: string, key: string): Promise<boolean>;
}
