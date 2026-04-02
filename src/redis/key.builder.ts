export class RedisKeyBuilder {
  private static service = 'url-shortener';

  static build(namespace: string, key: string): string {
    return `${this.service}:${namespace}:${key}`;
  }
}
