import { Injectable } from '@nestjs/common';
import { type IDAO } from '../dao/interfaces';
import { CacheNamespaces, RedisOptions } from '../constants';
import { IRedirectService } from './interfaces';
import { type ICacheService } from '../redis/interfaces';
import { InjectCacheService, InjectDAO } from '../utils/injecters';
import { LinkExpiredError, LinkNotFoundError } from '../link/errors';

@Injectable()
export class RedirectService implements IRedirectService {
  constructor(
    @InjectDAO()
    private readonly dao: IDAO,
    @InjectCacheService()
    private readonly cache: ICacheService,
  ) {}

  async resolve(code: string): Promise<string> {
    return this.cache.getOrSet(
      CacheNamespaces.LINK_RESOLVE,
      code,
      async () => this._resolve(code),
      { ttlSeconds: RedisOptions.TTL_SECONDS },
    );
  }

  private async _resolve(code: string): Promise<string> {
    const link = await this.dao.links.findPartialLinkByCode(code);

    if (!link) throw new LinkNotFoundError(code);

    if (link.expires_at && link.expires_at < new Date()) {
      throw new LinkExpiredError(code, link.expires_at);
    }

    return link.original_url;
  }
}
