import { Knex } from 'knex';
import { Repository } from '../constants';
import { Inject, Injectable } from '@nestjs/common';
import type { IDAO, ILinkRepository } from './interfaces';

@Injectable()
export class DaoService implements IDAO {
  constructor(
    @Inject(Repository.DATABASE)
    public readonly db: Knex,
    @Inject(Repository.LINKS)
    public readonly links: ILinkRepository,
  ) {}
}
