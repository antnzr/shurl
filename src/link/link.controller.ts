import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { ILinkService } from './interfaces';
import { InjectLinkService } from '../utils/injecters';
import { CreateLinkRequest, LinkResponse } from './dto';
import { API_V1 } from '../constants';

@Controller({ path: 'links', version: API_V1 })
export class LinkController {
  constructor(
    @InjectLinkService()
    private readonly linkService: ILinkService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateLinkRequest): Promise<LinkResponse> {
    return this.linkService.create(dto);
  }
}
