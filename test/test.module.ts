import { Provider } from '@nestjs/common';
import { linkProvider } from '../src/link/link.module';
import { codeGeneratorProvider } from '../src/code-generator/code-generator.module';
import { Test, TestingModule } from '@nestjs/testing';
import { Knex } from 'knex';
import { ConfigModule } from '@nestjs/config';
import configuration from '../src/config/configuration';
import validate from '../src/config/validate';
import { daoProviders } from '../src/dao/dao.module';
import { Repository } from '../src/constants';

function appProviders(): Provider[] {
  return [...daoProviders, linkProvider, codeGeneratorProvider];
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
} = {}): Promise<TestingModule> {
  const module = Test.createTestingModule({
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
    module.overrideProvider(Repository.DATABASE).useValue(knex);
  }

  return module.compile();
}
