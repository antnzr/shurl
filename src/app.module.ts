import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { DaoModule } from './dao/dao.module';
import { LinkModule } from './link/link.module';
import configuration from './config/configuration';
import validate from './config/validate';
import logConf from './config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true, load: [configuration] }),
    LoggerModule.forRootAsync({ inject: [ConfigService], useFactory: logConf }),
    DaoModule,
    LinkModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
