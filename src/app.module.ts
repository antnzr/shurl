import { Module } from '@nestjs/common';
import validate from './config/validate';
import { LoggerModule } from 'nestjs-pino';
import { DaoModule } from './dao/dao.module';
import logConf from './config/logger.config';
import { LinkModule } from './link/link.module';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { RedirectModule } from './redirect/redirect.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CodeGeneratorModule } from './code-generator/code-generator.module';
import { ObservabilityModule } from './observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true, load: [configuration] }),
    LoggerModule.forRootAsync({ inject: [ConfigService], useFactory: logConf }),
    DaoModule,
    LinkModule,
    RedirectModule,
    CodeGeneratorModule,
    ObservabilityModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
