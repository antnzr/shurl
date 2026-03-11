import { BaseEntity } from './base';

export class LinkEntity extends BaseEntity {
  slug!: string;
  original_url!: string;
  expires_at!: Date | string | null;
}
