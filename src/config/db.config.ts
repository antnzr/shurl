export default function (connectionString: string) {
  return {
    client: 'pg',
    dialect: 'postgres',
    // debug: true,
    pool: {
      max: 10,
      acquireTimeoutMillis: 10_000,
    },
    connection: {
      connectionString,
      multipleStatements: true,
    },
  };
}
