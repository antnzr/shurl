import {
  InjectDAO,
  InjectCodeGeneratorService,
  InjectObservabilityService,
} from '../utils/injecters';
import { mapTo } from '../utils/map-to';
import { ILinkService } from './interfaces';
import { meter } from '../observability/dto';
import type { IDAO } from '../dao/interfaces';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateLinkRequest, LinkResponse } from './dto';
import { PGErrorCode } from '../common/errors/error.code';
import { isPgUniqueViolationError } from '../common/errors/pg.error';
import { AppHttpException } from '../common/errors/app.exception-error';
import { type IObservabilityService } from '../observability/interfaces';
import type { ICodeGeneratorService } from '../code-generator/interfaces';

const CREATE_ATTEMPTS = 5;
const LINK_CREATE = 'link.create';

@Injectable()
export class LinkService implements ILinkService {
  constructor(
    @InjectDAO()
    private readonly dao: IDAO,
    @InjectCodeGeneratorService()
    private readonly codeGeneratorService: ICodeGeneratorService,
    @InjectObservabilityService()
    private readonly obs: IObservabilityService,
  ) {}

  async create(dto: CreateLinkRequest): Promise<LinkResponse> {
    const start = this.obs.start(LINK_CREATE);

    const { url } = dto;

    for (let i = 0; i < CREATE_ATTEMPTS; i++) {
      try {
        const code = this.codeGeneratorService.generateCode();

        const entity = await this.dao.links.create({
          code,
          originalUrl: url,
        });

        this.obs.success(LINK_CREATE, start);
        return mapTo(LinkResponse, entity);
      } catch (err: unknown) {
        if (
          isPgUniqueViolationError(err) &&
          err.code === PGErrorCode.UNIQUE_VIOLATION
        ) {
          this.obs.retry(LINK_CREATE);
          continue;
        }

        this.obs.error(LINK_CREATE);
        throw err; // 👈 important fix
      }
    }

    this.obs.error(LINK_CREATE);

    throw new AppHttpException(HttpStatus.INTERNAL_SERVER_ERROR, {
      message:
        'Failed to create link after multiple attempts due to code collisions',
    });
  }
}
