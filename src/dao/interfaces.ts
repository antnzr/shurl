import { Knex } from 'knex';
import { LinkEntity } from './entity';
import { CreateLinkDto, LinkResolveDto } from './dto';

export interface IDAO {
  db: Knex;
  links: ILinkRepository;
}

export interface ILinkRepository {
  create(dto: CreateLinkDto): Promise<LinkEntity>;
  findByCode(code: string): Promise<LinkEntity | null>;
  findPartialLinkByCode(code: string): Promise<LinkResolveDto | null>;
}
