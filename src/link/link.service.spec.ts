import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { ILinkService } from './interfaces';
import { TestInfra } from '../../test/infra';
import { Service, Table } from '../constants';
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
  });
});
