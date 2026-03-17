import { Service } from '../constants';
import { DaoModule } from '../dao/dao.module';
import { LinkModule } from '../link/link.module';
import { Module, Provider } from '@nestjs/common';
import { RedirectService } from './redirect.service';
import { RedirectController } from './redirect.controller';

export const redirectProvider: Provider = {
  provide: Service.REDIRECT,
  useClass: RedirectService,
};

@Module({
  imports: [LinkModule, DaoModule],
  controllers: [RedirectController],
  providers: [redirectProvider],
})
export class RedirectModule {}
