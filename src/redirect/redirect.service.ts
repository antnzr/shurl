import { Injectable } from '@nestjs/common';
import { type IDAO } from '../dao/interfaces';
import { InjectDAO } from '../utils/injecters';
import { IRedirectService } from './interfaces';
import { LinkExpiredError, LinkNotFoundError } from '../link/errors';

@Injectable()
export class RedirectService implements IRedirectService {
  constructor(
    @InjectDAO()
    private readonly dao: IDAO,
  ) {}

  async resolve(code: string): Promise<string> {
    const link = await this.dao.links.findPartialLinkByCode(code);

    if (!link) {
      throw new LinkNotFoundError(code);
    }

    if (link.expires_at && link.expires_at < new Date()) {
      throw new LinkExpiredError(code, link.expires_at);
    }

    return link.original_url!;
  }
}
