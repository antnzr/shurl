import { Injectable } from '@nestjs/common';
import { type RedisClientType } from 'redis';
import { RedisKeyBuilder } from './key.builder';
import { JsonSerializer } from '../utils/serializer';
import { InjectRedisClient } from '../utils/injecters';
import { CacheSetOptions, ICacheService } from './interfaces';

@Injectable()
export class CacheService implements ICacheService {
  constructor(
    @InjectRedisClient()
    private readonly redisClient: RedisClientType,
  ) {}

  async get<TData>(namespace: string, key: string): Promise<TData | null> {
    const fullKey = RedisKeyBuilder.build(namespace, key);

    const raw = await this.redisClient.get(fullKey);
    if (raw === null) return null;

    return JsonSerializer.deserialize(raw);
  }

  async getOrSet<T>(
    namespace: string,
    key: string,
    factory: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<T> {
    const existing = await this.get<T>(namespace, key);

    if (existing !== null) return existing;

    const value = await factory();

    await this.set(namespace, key, value, options);

    return value;
  }

  async set<TData>(
    namespace: string,
    key: string,
    value: TData,
    options?: CacheSetOptions,
  ): Promise<void> {
    const fullKey = RedisKeyBuilder.build(namespace, key);
    const ttl = options?.ttlSeconds ?? 0;

    const serialized = JsonSerializer.serialize(value);
    if (serialized === null) return;

    await this.redisClient.set(fullKey, serialized, {
      ...(ttl && { EX: ttl }),
    });
  }

  async delete(namespace: string, key: string): Promise<boolean> {
    const fullKey = RedisKeyBuilder.build(namespace, key);
    const num = await this.redisClient.del(fullKey);
    return num > 0;
  }
}
