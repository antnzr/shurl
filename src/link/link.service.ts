import { mapTo } from '../utils/map-to';
import { Injectable } from '@nestjs/common';
import { ILinkService } from './interfaces';
import type { IDAO } from '../dao/interfaces';
import { CreateLinkRequest, LinkResponse } from './dto';
import type { ICodeGeneratorService } from '../code-generator/interfaces';
import { InjectCodeGeneratorService, InjectDAO } from '../utils/injecters';

const CREATE_ATTEMPTS = 5;

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
      } catch (err) {
        if (err?.['code'] === '23505') {
          continue; // collision → retry
        }

        throw err;
      }
    }

    throw new Error('Failed to generate a unique code after 5 attempts');
  }
}
