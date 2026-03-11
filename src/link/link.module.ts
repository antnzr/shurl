import { Module, Provider } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { Service } from '../constants';
import { DaoModule } from '../dao/dao.module';

export const linkProvider: Provider = {
  provide: Service.LINK,
  useClass: LinkService,
};

@Module({
  imports: [DaoModule],
  controllers: [LinkController],
  providers: [linkProvider],
  exports: [linkProvider],
})
export class LinkModule {}
