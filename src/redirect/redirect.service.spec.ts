import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { TestInfra } from '../../test/infra';
import { Service, Table } from '../constants';
import { IRedirectService } from './interfaces';
import { ILinkService } from '../link/interfaces';
import { APP_TestingModule, TestApp } from '../../test/test.module';
import { LinkExpiredError, LinkNotFoundError } from '../link/errors';

describe('IRedirectService', () => {
  let service: IRedirectService;
  let linkService: ILinkService;
  let app: TestApp;
  let db: Knex;

  const infra = TestInfra.getInstance();

  beforeAll(async () => {
    await infra.up();
    const { knex } = await infra.makeInfraServices();
    db = knex;

    app = await APP_TestingModule({ knex });

    service = app.get<IRedirectService>(Service.REDIRECT);
    linkService = app.get<ILinkService>(Service.LINK);
  });

  afterAll(async () => {
    await db.destroy();
    await app.close();
  });

  afterEach(async () => {
    await db(Table.LINKS).del();
  });

  describe('resolve', () => {
    it('should resolve existing link', async () => {
      const url = faker.internet.url();

      const created = await linkService.create({ url });

      const result = await service.resolve(created.code);

      expect(result).toBe(url);
    });

    it('should throw LinkNotFoundError when link does not exist', async () => {
      await expect(service.resolve('notfound')).rejects.toThrow(
        LinkNotFoundError,
      );
    });

    it('should throw LinkNotFoundError when link is deleted', async () => {
      const url = faker.internet.url();

      const created = await linkService.create({ url });

      await db(Table.LINKS)
        .where({ id: created.id })
        .update({ deleted_at: new Date() });

      await expect(service.resolve(created.code)).rejects.toThrow(
        LinkNotFoundError,
      );
    });

    it('should throw LinkExpiredError when link is expired', async () => {
      const url = faker.internet.url();

      const created = await linkService.create({ url });
      await db(Table.LINKS)
        .where({ id: created.id })
        .update({ expires_at: new Date(Date.now() - 1000) });

      await expect(service.resolve(created.code)).rejects.toThrow(
        LinkExpiredError,
      );
    });

    it('should resolve when expired_at is in the future', async () => {
      const url = faker.internet.url();

      const created = await linkService.create({ url });
      await db(Table.LINKS)
        .where({ id: created.id })
        .update({ expires_at: new Date(Date.now() + 100000) });

      const result = await service.resolve(created.code);

      expect(result).toBe(url);
    });
  });
});
