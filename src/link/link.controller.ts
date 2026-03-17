import {
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { API_V1 } from '../constants';
import type { ILinkService } from './interfaces';
import { InjectLinkService } from '../utils/injecters';
import { CreateLinkRequest, LinkResponse } from './dto';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

@ApiTags('Link')
@Controller({ path: 'links', version: API_V1 })
export class LinkController {
  constructor(
    @InjectLinkService()
    private readonly linkService: ILinkService,
  ) {}

  @ApiOperation({ description: 'Create a new short link.' })
  @ApiBody({ type: CreateLinkRequest })
  @ApiCreatedResponse({ type: LinkResponse })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateLinkRequest): Promise<LinkResponse> {
    return this.linkService.create(dto);
  }
}
