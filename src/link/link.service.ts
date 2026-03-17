import { mapTo } from '../utils/map-to';
import { ILinkService } from './interfaces';
import type { IDAO } from '../dao/interfaces';
import { LinkCollisionError } from './errors';
import { CreateLinkRequest, LinkResponse } from './dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PGErrorCode } from '../common/errors/error.code';
import { AppHttpException } from '../common/errors/app.exception-error';
import type { ICodeGeneratorService } from '../code-generator/interfaces';
import { InjectCodeGeneratorService, InjectDAO } from '../utils/injecters';

const CREATE_ATTEMPTS = 5;

function isPgUniqueViolationError(err: unknown): err is { code: PGErrorCode } {
  if (typeof err !== 'object' || err === null) return false;

  const maybeCode = (err as { code: unknown }).code;
  return Object.values(PGErrorCode).includes(maybeCode as PGErrorCode);
}

@Injectable()
export class LinkService implements ILinkService {
  constructor(
    @InjectDAO()
    private readonly dao: IDAO,
    @InjectCodeGeneratorService()
    private readonly codeGeneratorService: ICodeGeneratorService,
  ) {}

  async create(dto: CreateLinkRequest): Promise<LinkResponse> {
    const { url } = dto;

    for (let i = 0; i < CREATE_ATTEMPTS; i++) {
      try {
        const code = this.codeGeneratorService.generateCode();
        const entity = await this.dao.links.create({
          code,
          originalUrl: url,
        });

        return mapTo(LinkResponse, entity);
      } catch (err: unknown) {
        if (
          isPgUniqueViolationError(err) &&
          err.code === PGErrorCode.UNIQUE_VIOLATION
        ) {
          continue; // collision → retry
        }

        throw new LinkCollisionError(url);
      }
    }

    throw new AppHttpException(HttpStatus.INTERNAL_SERVER_ERROR, {
      message:
        'Failed to create link after multiple attempts due to code collisions',
    });
  }
}
