import { IsUrl } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class CreateLinkRequest {
  @IsUrl()
  url!: string;
}

export class LinkResponse {
  @Expose()
  id!: string;

  @Expose()
  code!: string;

  @Expose()
  @Transform(({ obj }) => obj.originalUrl || obj.original_url)
  originalUrl!: string;

  @Expose()
  @Transform(({ obj }) => obj.createdAt || obj.created_at)
  createdAt!: Date | string;

  @Expose()
  @Transform(({ obj }) => obj.updatedAt || obj.updated_at)
  updatedAt!: Date | string;

  @Expose()
  @Transform(({ obj }) => obj.deletedAt || obj.deleted_at)
  deletedAt?: Date | null;

  @Expose()
  @Transform(({ obj }) => obj.expiresAt || obj.expires_at)
  expiresAt?: Date | string | null;
}
