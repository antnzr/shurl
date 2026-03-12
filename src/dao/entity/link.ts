import { BaseEntity } from './base';

export class LinkEntity extends BaseEntity {
  code!: string;
  original_url!: string;
  expires_at!: Date | string | null;
}
