import { Knex } from 'knex';
import { Service } from '../constants';
import { faker } from '@faker-js/faker';
import { ILinkService } from './interfaces';
import { TestInfra } from '../../test/infra';
import { TestingModule } from '@nestjs/testing';
import { APP_TestingModule } from '../../test/test.module';

describe('ILinkService', () => {
  let service: ILinkService;
  let db: Knex;

  const infra = TestInfra.getInstance();

  beforeAll(async () => {
    await infra.up();
    const { knex } = await infra.makeInfraServices();
    db = knex;

    const module: TestingModule = await APP_TestingModule({ knex });
    service = module.get<ILinkService>(Service.LINK);
  });

  afterAll(async () => {
    await db?.destroy();
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
