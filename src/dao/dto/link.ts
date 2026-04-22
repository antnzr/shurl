import { LinkEntity } from '../entity';

export class CreateLinkDto {
  code!: string;
  originalUrl!: string;
  expiresAt?: Date | string | null;
}

export class UpdateLinkExpirationDto {
  code!: string;
  expiresAt!: Date | string | null;
}

export type LinkResolveDto = Pick<LinkEntity, 'original_url' | 'expires_at'>;
