import { Knex } from 'knex';
import { RedisClientType } from 'redis';
import validate from '../src/config/validate';
import { ConfigModule } from '@nestjs/config';
import { daoProviders } from '../src/dao/dao.module';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository, Service } from '../src/constants';
import { linkProvider } from '../src/link/link.module';
import configuration from '../src/config/configuration';
import { InjectionToken, Provider } from '@nestjs/common';
import { redisProviders } from '../src/redis/redis.module';
import { redirectProvider } from '../src/redirect/redirect.module';
import { observabilityProvider } from '../src/observability/observability.module';
import { codeGeneratorProvider } from '../src/code-generator/code-generator.module';

export class TestApp {
  constructor(private readonly module: TestingModule) {}

  get<T>(token: InjectionToken): T {
    return this.module.get<T>(token);
  }

  async close() {
    const redis = this.module.get<RedisClientType>(Service.REDIS_CLIENT, {
      strict: false,
    });

    if (redis) await redis.quit();

    await this.module.close();
  }
}

function appProviders(): Provider[] {
  return [
    ...daoProviders,
    ...redisProviders,
    linkProvider,
    redirectProvider,
    observabilityProvider,
    codeGeneratorProvider,
  ];
}

/**
 * Creates a testing module for the application.
 * To reduce boilerplate, it automatically imports ConfigModule with test configuration and all app providers, but it also allows to override them if needed.
 * It also allows to override the database connection with a test one.
 * Usage:
 * const module: TestingModule = await APP_TestingModule({ knex: testKnex });
 * const service = module.get<ILinkService>(Service.LINK);
 */
export async function APP_TestingModule({
  knex,
  providers,
}: {
  knex?: Knex;
  providers?: Provider[];
} = {}): Promise<TestApp> {
  const builder = Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        validate,
        isGlobal: true,
        load: [configuration],
        envFilePath: 'env.test',
      }),
    ],
    providers: [...appProviders(), ...(providers || [])],
  });

  if (knex) {
    builder.overrideProvider(Repository.DATABASE).useValue(knex);
  }

  const module = await builder.compile();

  return new TestApp(module);
}
