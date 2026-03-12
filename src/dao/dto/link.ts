export class CreateLinkDto {
  code!: string;
  originalUrl!: string;
  expiresAt?: Date | string | null;
}
