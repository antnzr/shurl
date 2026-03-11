import { Knex } from 'knex';
import { ILinkRepository } from '../interfaces';
import { InjectDB } from '../../utils/injecters';

export class LinkRepository implements ILinkRepository {
  constructor(
    @InjectDB()
    private readonly db: Knex,
  ) {}
}
