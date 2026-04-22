import { Knex } from 'knex';
import { LinkEntity } from './entity';
import { CreateLinkDto, LinkResolveDto, UpdateLinkExpirationDto } from './dto';

export interface IDAO {
  db: Knex;
  links: ILinkRepository;
}

export interface ILinkRepository {
  create(dto: CreateLinkDto): Promise<LinkEntity>;
  updateExpiration(dto: UpdateLinkExpirationDto): Promise<LinkEntity | null>;
  findByCode(code: string): Promise<LinkEntity | null>;
  findPartialLinkByCode(code: string): Promise<LinkResolveDto | null>;
}
