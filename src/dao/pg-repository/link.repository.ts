import { Knex } from 'knex';
import { LinkEntity } from '../entity';
import { Table } from '../../constants';
import { ILinkRepository } from '../interfaces';
import { InjectDB } from '../../utils/injecters';
import { CreateLinkDto, LinkResolveDto } from '../dto';

export class LinkRepository implements ILinkRepository {
  constructor(
    @InjectDB()
    private readonly db: Knex,
  ) {}

  async create(dto: CreateLinkDto): Promise<LinkEntity> {
    const { code, originalUrl, expiresAt } = dto;
    const [result] = await this.db<LinkEntity>(Table.LINKS)
      .insert({
        code,
        original_url: originalUrl,
        expires_at: expiresAt ? new Date(expiresAt) : null,
      })
      .returning('*');
    return result;
  }

  async findByCode(code: string): Promise<LinkEntity | null> {
    const result = await this.db<LinkEntity>(Table.LINKS)
      .where({ code, deleted_at: null })
      .first();
    return result || null;
  }

  async findPartialLinkByCode(
    code: string,
  ): Promise<LinkResolveDto | null> {
    const result = await this.db<LinkEntity>(Table.LINKS)
      .where({ code, deleted_at: null })
      .select('original_url', 'expires_at')
      .first();
    return result || null;
  }
}
