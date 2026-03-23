import { Inject } from '@nestjs/common';
import { Repository, Service } from '../constants';

export const InjectDB = (): ParameterDecorator => Inject(Repository.DATABASE);
export const InjectDAO = (): ParameterDecorator => Inject(Service.DAO);
export const InjectLinkService = (): ParameterDecorator => Inject(Service.LINK);
export const InjectRedirectService = (): ParameterDecorator =>
  Inject(Service.REDIRECT);
export const InjectCodeGeneratorService = (): ParameterDecorator =>
  Inject(Service.CODE_GENERATOR);
export const InjectObservabilityService = (): ParameterDecorator =>
  Inject(Service.OBSERVABILITY);
