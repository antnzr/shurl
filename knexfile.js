require('dotenv').config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ...(process.env.NODE_ENV !== 'development' && {
      ssl: { rejectUnauthorized: false },
    }),
  },
  seeds: { directory: './db/seeds' },
  migrations: { tableName: 'knex_migrations', directory: './db/migrations' },
};
