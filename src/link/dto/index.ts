import { IsUrl } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkRequest {
  @ApiProperty({ example: 'https://example.com' })
  @IsUrl()
  url!: string;
}

export class LinkResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'abc123' })
  @Expose()
  code!: string;

  @ApiProperty({ example: 'https://example.com' })
  @Expose()
  @Transform(({ obj }) => obj.originalUrl || obj.original_url)
  originalUrl!: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ obj }) => obj.createdAt || obj.created_at)
  createdAt!: Date | string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ obj }) => obj.updatedAt || obj.updated_at)
  updatedAt!: Date | string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ obj }) => obj.deletedAt || obj.deleted_at)
  deletedAt?: Date | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ obj }) => obj.expiresAt || obj.expires_at)
  expiresAt?: Date | string | null;
}
