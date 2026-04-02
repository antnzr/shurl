import {
  Global,
  Inject,
  Logger,
  Module,
  Provider,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Service } from '../constants';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { createClient, type RedisClientType } from 'redis';

const log = new Logger('RedisModule');

export const redisProviders: Provider[] = [
  {
    provide: Service.REDIS_CLIENT,
    useFactory: async (config: ConfigService) => {
      const client = createClient({
        url: config.get<string>('redis'),
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            const delay = Math.min(100 * 2 ** retries, 30_000);
            log.warn(`Redis reconnect attempt ${retries + 1} in ${delay}ms`);
            return delay;
          },
        },
      });

      client
        .on('error', (err: unknown) => log.error({ msg: 'Redis error', err }))
        .on('connect', () => log.log('Connected to Redis'))
        .on('ready', () => log.log('Redis ready'))
        .on('reconnecting', () => log.warn('Reconnecting to Redis...'))
        .on('end', () => log.warn('Redis connection closed'));

      await client.connect();
      await client.ping();

      return client;
    },
    inject: [ConfigService],
  },
  {
    provide: Service.CACHE,
    useClass: CacheService,
  },
];

@Global()
@Module({
  providers: redisProviders,
  exports: redisProviders,
})
export class RedisModule implements OnApplicationShutdown {
  constructor(
    @Inject(Service.REDIS_CLIENT)
    private readonly redis: RedisClientType,
  ) {}

  async onApplicationShutdown() {
    log.log('Closing Redis connection');
    try {
      await this.redis.quit();
    } catch (error: unknown) {
      log.error({ error }, 'Error occurred while closing Redis connection');
    }
  }
}
