import { Service } from '../constants';
import { Module, Provider } from '@nestjs/common';
import { ObservabilityService } from './observability.service';

export const observabilityProvider: Provider = {
  provide: Service.OBSERVABILITY,
  useClass: ObservabilityService,
};

@Module({
  providers: [observabilityProvider],
  exports: [observabilityProvider],
})
export class ObservabilityModule {}
