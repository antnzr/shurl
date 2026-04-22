import {
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { API_V1 } from '../constants';
import type { ILinkService } from './interfaces';
import { InjectLinkService } from '../utils/injecters';
import {
  LinkResponse,
  CreateLinkRequest,
  UpdateLinkExpirationRequest,
} from './dto';
import {
  ApiLinkNotFound,
  ApiInternalError,
  ApiLinkCollision,
  ApiValidationError,
} from '../decorators/api-error';
import {
  Body,
  Post,
  Patch,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';

@ApiTags('Link')
@Controller({ path: 'links', version: API_V1 })
export class LinkController {
  constructor(
    @InjectLinkService()
    private readonly linkService: ILinkService,
  ) {}

  @ApiOperation({ description: 'Create a new short link.' })
  @ApiBody({ type: CreateLinkRequest })
  @ApiLinkCollision()
  @ApiValidationError()
  @ApiInternalError()
  @ApiCreatedResponse({ type: LinkResponse })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateLinkRequest): Promise<LinkResponse> {
    return this.linkService.create(dto);
  }

  @ApiOperation({ description: 'Update link expiration.' })
  @ApiBody({ type: UpdateLinkExpirationRequest })
  @ApiValidationError()
  @ApiLinkNotFound()
  @ApiInternalError()
  @ApiOkResponse({ type: LinkResponse })
  @Patch()
  @HttpCode(HttpStatus.OK)
  updateExpiration(
    @Body() dto: UpdateLinkExpirationRequest,
  ): Promise<LinkResponse> {
    return this.linkService.updateExpiration(dto);
  }
}
