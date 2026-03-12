import {
  Logger,
  Module,
  Provider,
  OnApplicationShutdown,
} from '@nestjs/common';
import knex, { Knex } from 'knex';
import { ModuleRef } from '@nestjs/core';
import { DaoService } from './dao.service';
import dbConfig from '../config/db.config';
import { ConfigService } from '@nestjs/config';
import { Environment, Repository, Service } from '../constants';
import { LinkRepository } from './pg-repository/link.repository';

const log = new Logger();

export const knexProvider: Provider = {
  provide: Repository.DATABASE,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const env = config.get<string>('nodeEnv')!;
    const dbConf = dbConfig(config.get<string>('database')!);

    dbConf.connection = {
      ...dbConf.connection,
      ...(env !== Environment.Dev && {
        ssl: { rejectUnauthorized: false },
      }),
    };
    const db = knex(dbConf);

    db.on('query-error', (error, query) => {
      log.error({ tag: 'db', query, error });
    });

    return db;
  },
};

export const daoProvider: Provider = {
  provide: Service.DAO,
  useClass: DaoService,
};

export const daoProviders: Provider[] = [
  knexProvider,
  daoProvider,
  {
    provide: Repository.LINKS,
    useClass: LinkRepository,
  },
];

@Module({
  providers: daoProviders,
  exports: [daoProvider],
})
export class DaoModule implements OnApplicationShutdown {
  private readonly log = new Logger(DaoModule.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown() {
    const connection = this.moduleRef.get<Knex>(Repository.DATABASE);
    try {
      if (connection) await connection.destroy();
    } catch (err) {
      this.log.error({ tag: this.onApplicationShutdown.name, err });
    }
  }
}
