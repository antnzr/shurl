import { Knex } from 'knex';
import { LinkEntity } from '../entity';
import { CreateLinkDto } from '../dto';
import { Table } from '../../constants';
import { ILinkRepository } from '../interfaces';
import { InjectDB } from '../../utils/injecters';

export class LinkRepository implements ILinkRepository {
  constructor(
    @InjectDB()
    private readonly db: Knex,
  ) {}

  async create(dto: CreateLinkDto): Promise<LinkEntity> {
    const [result] = await this.db<LinkEntity>(Table.LINKS)
      .insert(this._mapToLink(dto))
      .returning('*');
    return result;
  }

  private _mapToLink(dto: CreateLinkDto): Partial<LinkEntity> {
    return {
      code: dto.code,
      original_url: dto.originalUrl,
      expires_at: dto.expiresAt ? new Date(dto.expiresAt) : null,
    };
  }
}
