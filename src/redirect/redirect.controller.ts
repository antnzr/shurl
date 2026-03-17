import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiFoundResponse,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { type IRedirectService } from './interfaces';
import { InjectRedirectService } from '../utils/injecters';
import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ApiLinkExpired, ApiLinkNotFound } from '../decorators/api-error';

@ApiTags('Redirect')
@Controller()
export class RedirectController {
  constructor(
    @InjectRedirectService()
    private readonly redirectService: IRedirectService,
  ) {}

  @ApiOperation({ summary: 'Redirect to original URL by short code' })
  @ApiParam({
    name: 'code',
    example: 'abc123',
    description: 'Short code of the link',
  })
  @ApiLinkNotFound()
  @ApiLinkExpired()
  @ApiFoundResponse({ description: 'Redirect to original URL' })
  @Get(':code')
  async redirect(
    @Param('code') code: string,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const url = await this.redirectService.resolve(code);
    reply.redirect(url, HttpStatus.FOUND);
  }
}
