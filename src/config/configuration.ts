import { Environment } from '../constants';

export interface AppConfig {
  nodeEnv: Environment;
  appPort: number;
  appAddr: string;
  database: string;
  redis: string;
}

export default (): AppConfig =>
  ({
    nodeEnv: process.env.NODE_ENV || Environment.Dev,
    appPort: parseInt(process.env.PORT ?? '3007', 10),
    appAddr: process.env.ADDR,
    database: process.env.DATABASE_URL,
    redis: process.env.REDIS_URL,
  }) as AppConfig;
