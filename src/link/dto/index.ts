import { IsUrl } from 'class-validator';
import { getField } from '../../utils/get-field';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @Transform(({ obj }) => getField<string>(obj, 'originalUrl', 'original_url'))
  originalUrl!: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ obj }) => getField<string>(obj, 'createdAt', 'created_at'))
  createdAt!: Date | string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ obj }) => getField<string>(obj, 'updatedAt', 'updated_at'))
  updatedAt!: Date | string;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ obj }) => getField<string>(obj, 'deletedAt', 'deleted_at'))
  deletedAt?: Date | null;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ obj }) => getField<string>(obj, 'expiresAt', 'expires_at'))
  expiresAt?: Date | string | null;
}
