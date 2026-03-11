import { Knex } from 'knex';

export interface IDAO {
  db: Knex;
  links: ILinkRepository;
}

export interface ILinkRepository {}
