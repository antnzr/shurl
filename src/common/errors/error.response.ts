import { ErrorCode } from './error.code';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ example: 'Internal Server Error' })
  message!: string;

  @ApiProperty({ example: ErrorCode.INTERNAL_ERROR })
  errorCode!: string;

  @ApiProperty({ example: '/abc123' })
  path!: string;

  @ApiProperty({ example: 'req-5' })
  requestId!: string;

  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  statusCode!: number;

  @ApiProperty({ example: '2026-03-15T10:15:12.221Z' })
  timestamp!: string;

  @ApiPropertyOptional({ example: { expiredAt: '2026-03-14T10:00:00Z' } })
  details?: unknown;

  @ApiPropertyOptional({ example: '9d1a5e8a-3c7b-4f12' })
  errorId?: string;
}
