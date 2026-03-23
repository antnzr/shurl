export enum Environment {
  Dev = 'development',
  Prod = 'production',
  Test = 'test',
  Stage = 'stage',
  Local = 'local',
}

export enum Service {
  DAO = 'DAO_SERVICE',
  LINK = 'LINK_SERVICE',
  REDIRECT = 'REDIRECT_SERVICE',
  OBSERVABILITY = 'OBSERVABILITY_SERVICE',
  CODE_GENERATOR = 'CODE_GENERATOR_SERVICE',
}

export enum Repository {
  DATABASE = 'DATABASE',
  LINKS = 'LINKS_REPOSITORY',
}

export enum Table {
  LINKS = 'links',
}

export const SHURL_TITLE = 'SHURL';
export const BODY_LIMIT = 10_485_760; // 10MB
export const API_V1 = '1';
export const DEFAULT_CODE_LENGTH = 7;
