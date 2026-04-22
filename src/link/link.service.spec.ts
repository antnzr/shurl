import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { ILinkService } from './interfaces';
import { TestInfra } from '../../test/infra';
import { LinkNotFoundError } from './errors';
import { Service, Table } from '../constants';
import { ValidationError } from '../common/errors/validation.error';
import { APP_TestingModule, TestApp } from '../../test/test.module';

describe('ILinkService', () => {
  let service: ILinkService;
  let db: Knex;
  let app: TestApp;

  const infra = TestInfra.getInstance();

  beforeAll(async () => {
    await infra.up();
    const { knex } = await infra.makeInfraServices();
    db = knex;

    app = await APP_TestingModule({ knex });
    service = app.get<ILinkService>(Service.LINK);
  });

  afterAll(async () => {
    await db.destroy();
    await app.close();
  });

  afterEach(async () => {
    await db(Table.LINKS).del();
  });

  describe('create', () => {
    it('should create', async () => {
      const url = faker.internet.url();
      const result = await service.create({ url });

      expect(result.id).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.originalUrl).toBe(url);
      expect(result.expiresAt).toBeNull();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create with expiresAt', async () => {
      const url = faker.internet.url();
      const expiresAt = new Date(Date.now() + 60_000).toISOString();

      const result = await service.create({ url, expiresAt });

      expect(new Date(result.expiresAt!).toISOString()).toBe(expiresAt);
    });

    it('should reject past expiresAt', async () => {
      const url = faker.internet.url();
      const expiresAt = new Date(Date.now() - 60_000).toISOString();

      await expect(service.create({ url, expiresAt })).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('updateExpiration', () => {
    it('should set future expiresAt', async () => {
      const created = await service.create({ url: faker.internet.url() });
      const expiresAt = new Date(Date.now() + 60_000).toISOString();

      const result = await service.updateExpiration({
        code: created.code,
        expiresAt,
      });

      expect(new Date(result.expiresAt!).toISOString()).toBe(expiresAt);
    });

    it('should clear expiresAt with null', async () => {
      const created = await service.create({
        url: faker.internet.url(),
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      });

      const result = await service.updateExpiration({
        code: created.code,
        expiresAt: null,
      });

      expect(result.expiresAt).toBeNull();
    });

    it('should reject past expiresAt on update', async () => {
      const created = await service.create({ url: faker.internet.url() });

      await expect(
        service.updateExpiration({
          code: created.code,
          expiresAt: new Date(Date.now() - 60_000).toISOString(),
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('should return not found for unknown code', async () => {
      await expect(
        service.updateExpiration({
          code: 'missing',
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
        }),
      ).rejects.toThrow(LinkNotFoundError);
    });

    it('should return not found for deleted link', async () => {
      const created = await service.create({ url: faker.internet.url() });

      await db(Table.LINKS)
        .where({ id: created.id })
        .update({ deleted_at: new Date() });

      await expect(
        service.updateExpiration({
          code: created.code,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
        }),
      ).rejects.toThrow(LinkNotFoundError);
    });
  });
});
