import { Provider } from '@nestjs/common';
import { Service } from '../../src/constants';

export const redisMock: Provider = {
  provide: Service.REDIS_CLIENT,
  useValue: {
    quit: () => Promise.resolve(),
    get: () => Promise.resolve(null),
    set: () => Promise.resolve(null),
    close: () => Promise.resolve(),
  },
};
