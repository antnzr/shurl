import { Module, Provider } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { Service } from '../constants';
import { DaoModule } from '../dao/dao.module';
import { CodeGeneratorModule } from '../code-generator/code-generator.module';
import { ObservabilityModule } from '../observability/observability.module';

export const linkProvider: Provider = {
  provide: Service.LINK,
  useClass: LinkService,
};

@Module({
  imports: [DaoModule, ObservabilityModule, CodeGeneratorModule],
  controllers: [LinkController],
  providers: [linkProvider],
  exports: [linkProvider],
})
export class LinkModule {}
