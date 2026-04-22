import { Injectable } from '@nestjs/common';
import { LinkResolveDto } from '../dao/dto';
import { type IDAO } from '../dao/interfaces';
import { IRedirectService } from './interfaces';
import { type ICacheService } from '../redis/interfaces';
import { CacheNamespaces, RedisOptions } from '../constants';
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
    const cached = await this.cache.get<string>(
      CacheNamespaces.LINK_RESOLVE,
      code,
    );
    if (cached !== null) return cached;

    const link = await this.getActiveLink(code);
    const ttlSeconds = this.getCacheTtlSeconds(link.expires_at);

    if (ttlSeconds > 0) {
      await this.cache.set(
        CacheNamespaces.LINK_RESOLVE,
        code,
        link.original_url,
        { ttlSeconds },
      );
    }

    return link.original_url;
  }

  private async getActiveLink(code: string): Promise<LinkResolveDto> {
    const link = await this.dao.links.findPartialLinkByCode(code);

    if (!link) throw new LinkNotFoundError(code);

    if (link.expires_at && link.expires_at < new Date()) {
      throw new LinkExpiredError(code, link.expires_at);
    }

    return link;
  }

  private getCacheTtlSeconds(expiresAt: Date | string | null): number {
    if (!expiresAt) return RedisOptions.TTL_SECONDS;

    const remainingMs = new Date(expiresAt).getTime() - Date.now();
    if (remainingMs <= 0) return 0;

    return Math.min(RedisOptions.TTL_SECONDS, Math.floor(remainingMs / 1000));
  }
}
