import { Inject } from '@nestjs/common';
import { Repository, Service } from '../constants';

export const InjectDAO = (): ParameterDecorator => Inject(Service.DAO);

export const InjectDB = (): ParameterDecorator => Inject(Repository.DATABASE);
