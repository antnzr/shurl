import {
  InjectDAO,
  InjectCacheService,
  InjectCodeGeneratorService,
  InjectObservabilityService,
} from '../utils/injecters';
import { mapTo } from '../utils/map-to';
import { ILinkService } from './interfaces';
import type { IDAO } from '../dao/interfaces';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  LinkResponse,
  CreateLinkRequest,
  UpdateLinkExpirationRequest,
} from './dto';
import { OperationErrorType } from '../observability/dto';
import { PGErrorCode } from '../common/errors/error.code';
import { isPgUniqueViolationError } from '../common/errors/pg.error';
import { AppHttpException } from '../common/errors/app.exception-error';
import { type IObservabilityService } from '../observability/interfaces';
import type { ICodeGeneratorService } from '../code-generator/interfaces';
import { ValidationError } from '../common/errors/validation.error';
import { type ICacheService } from '../redis/interfaces';
import { CacheNamespaces } from '../constants';
import { LinkNotFoundError } from './errors';

const CREATE_ATTEMPTS = 5;
const LINK_CREATE = 'link.create';
const LINK_UPDATE = 'link.update';

@Injectable()
export class LinkService implements ILinkService {
  constructor(
    @InjectDAO()
    private readonly dao: IDAO,
    @InjectCodeGeneratorService()
    private readonly codeGeneratorService: ICodeGeneratorService,
    @InjectCacheService()
    private readonly cache: ICacheService,
    @InjectObservabilityService()
    private readonly obs: IObservabilityService,
  ) {}

  async create(dto: CreateLinkRequest): Promise<LinkResponse> {
    const start = this.obs.start(LINK_CREATE);

    const { url, expiresAt } = dto;

    try {
      this.validateExpiresAt(expiresAt, false);
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        this.obs.error(LINK_CREATE, OperationErrorType.BUSINESS);
      }

      throw err;
    }

    for (let i = 0; i < CREATE_ATTEMPTS; i++) {
      try {
        const code = this.codeGeneratorService.generateCode();

        const entity = await this.dao.links.create({
          code,
          expiresAt,
          originalUrl: url,
        });

        this.obs.success(LINK_CREATE, start);
        return mapTo(LinkResponse, entity);
      } catch (err: unknown) {
        if (
          isPgUniqueViolationError(err) &&
          err.code === PGErrorCode.UNIQUE_VIOLATION
        ) {
          this.obs.retry(LINK_CREATE, i + 1);
          continue;
        }

        this.obs.error(LINK_CREATE, OperationErrorType.BUSINESS);
        throw err; // 👈 important fix
      }
    }

    this.obs.error(LINK_CREATE, OperationErrorType.SYSTEM);
    throw new AppHttpException(HttpStatus.INTERNAL_SERVER_ERROR, {
      message:
        'Failed to create link after multiple attempts due to code collisions',
    });
  }

  async updateExpiration(
    dto: UpdateLinkExpirationRequest,
  ): Promise<LinkResponse> {
    const start = this.obs.start(LINK_UPDATE);
    const { code, expiresAt } = dto;

    try {
      this.validateExpiresAt(expiresAt, true);

      const entity = await this.dao.links.updateExpiration({
        code,
        expiresAt,
      });

      if (!entity) {
        throw new LinkNotFoundError(code);
      }

      await this.cache.delete(CacheNamespaces.LINK_RESOLVE, code);

      this.obs.success(LINK_UPDATE, start);
      return mapTo(LinkResponse, entity);
    } catch (err: unknown) {
      if (err instanceof ValidationError || err instanceof LinkNotFoundError) {
        this.obs.error(LINK_UPDATE, OperationErrorType.BUSINESS);
        throw err;
      }

      this.obs.error(LINK_UPDATE, OperationErrorType.SYSTEM);
      throw err;
    }
  }

  private validateExpiresAt(
    expiresAt: string | null | undefined,
    allowNull: boolean,
  ): void {
    if (expiresAt === undefined) return;

    if (expiresAt === null) {
      if (allowNull) return;

      throw new ValidationError([
        {
          field: 'expiresAt',
          errors: ['expiresAt must be a valid ISO 8601 date string'],
        },
      ]);
    }

    if (new Date(expiresAt) <= new Date()) {
      throw new ValidationError([
        {
          field: 'expiresAt',
          errors: ['expiresAt must be a future date'],
        },
      ]);
    }
  }
}
