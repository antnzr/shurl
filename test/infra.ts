import { join } from 'node:path';
import {
  Wait,
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from 'testcontainers';
import knex, { Knex } from 'knex';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import dbConfig from '../src/config/db.config';
import { Environment } from '../src/constants';
import { StartedGenericContainer } from 'testcontainers/build/generic-container/started-generic-container';

/**
 * Run container. Migrate, seed data to postgres.
 * To speed up tests, the same container is shared between tests, but each test creates its own database with a random name,
 * runs migrations and seeds on it, and then uses it for testing.
 * Usage:
 ** const infra = TestInfra.getInstance();
 ** await infra.up();
 ** const { knex } = await infra.makeInfraServices();
 * run tests
 ** await infra.down();
 */
export class TestInfra {
  private static instance: TestInfra;

  private readonly COMPOSE_FILE_NAME: string = 'docker-compose-test.yml';
  private readonly DB_CONTAINER_NAME: string = `db_test_db`;
  private readonly REDIS_CONTAINER_NAME: string = `redis_test_db`;

  private readonly config: ConfigService = new ConfigService();
  private readonly environment: DockerComposeEnvironment =
    new DockerComposeEnvironment(process.cwd(), this.COMPOSE_FILE_NAME);
  private _compose!: StartedDockerComposeEnvironment;
  private _dbContainer!: StartedGenericContainer;
  private _redisContainer!: StartedGenericContainer;

  private readonly PG_USER = 'postgres';
  private readonly PG_PASS = 'postgres';

  constructor() {
    this.init();
  }

  public static getInstance(): TestInfra {
    if (!TestInfra.instance) {
      TestInfra.instance = new TestInfra();
    }
    return TestInfra.instance;
  }

  private init() {
    const nodeEnv = this.config.get<string>('NODE_ENV');
    if (nodeEnv !== Environment.Test) throw new Error('Test env required');
  }

  public async makeInfraServices(): Promise<{ knex: Knex }> {
    this.setupRedis();
    const knex = await this.setupPostgresql();
    return { knex };
  }

  /**
   * Single postgresql instance is shared between tests, but each test creates its own database with a random name,
   * runs migrations and seeds on it, and then uses it for testing.
   * This approach allows to speed up tests while keeping them isolated.
   */
  private async setupPostgresql(): Promise<Knex> {
    const dbName = `d${randomBytes(12).toString('hex')}`;
    const createDbQuery = `CREATE DATABASE ${dbName};`;
    const grantPrivilegesQuery = `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${this.PG_USER};`;
    const dbContainer = this._compose.getContainer(this.DB_CONTAINER_NAME);

    await dbContainer.exec([
      'bash',
      '-c',
      `PGPASSWORD=${this.PG_PASS} psql -U ${this.PG_USER} -c "${createDbQuery}"`,
    ]);
    await dbContainer.exec([
      'bash',
      '-c',
      `PGPASSWORD=${this.PG_PASS} psql -U ${this.PG_USER} -c "${grantPrivilegesQuery}"`,
    ]);

    return this.prepareDb(dbName);
  }

  public async up(): Promise<boolean> {
    this._compose = await this.environment
      .withStartupTimeout(15_000)
      .withNoRecreate()
      .withWaitStrategy(
        this.DB_CONTAINER_NAME,
        Wait.forLogMessage('database system is ready to accept connections', 2),
      )
      .withWaitStrategy(
        this.REDIS_CONTAINER_NAME,
        Wait.forLogMessage('Ready to accept connections', 1),
      )
      .withBuild()
      .up();

    this._dbContainer = this._compose.getContainer(this.DB_CONTAINER_NAME);
    this._redisContainer = this._compose.getContainer(
      this.REDIS_CONTAINER_NAME,
    );
    return true;
  }

  public async down() {
    await this._compose?.down();
  }

  private setupRedis(): string {
    const host = this._redisContainer.getHost();
    const port = this._redisContainer.getFirstMappedPort();
    const redisUrl = `redis://${host}:${port}`;
    process.env.REDIS_URL = redisUrl;
    return redisUrl;
  }

  private async prepareDb(dbName?: string): Promise<Knex> {
    this._dbContainer = this._compose.getContainer(this.DB_CONTAINER_NAME);

    (await this._dbContainer.logs()).on('err', (line) => console.error(line));
    const host = this._dbContainer.getHost();
    const port = this._dbContainer.getFirstMappedPort();
    const dbUrl = `postgresql://${this.PG_USER}:${this.PG_PASS}@${host}:${port}/${dbName}`;

    return this.migrateDb(dbUrl);
  }

  private async migrateDb(dbUrl: string): Promise<Knex> {
    const _knex = knex({
      ...dbConfig(dbUrl),
      migrations: {
        tableName: 'knex_migrations',
        directory: join(process.cwd(), 'db', 'migrations'),
      },
      seeds: {
        directory: join(process.cwd(), 'db', 'seeds'),
      },
    });

    await _knex.migrate.latest();
    await _knex.seed.run();

    return _knex;
  }
}
