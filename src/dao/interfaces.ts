import { Knex } from 'knex';
import { LinkEntity } from './entity';
import { CreateLinkDto } from './dto';

export interface IDAO {
  db: Knex;
  links: ILinkRepository;
}

export interface ILinkRepository {
  create(dto: CreateLinkDto): Promise<LinkEntity>;
}
