import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { BODY_LIMIT } from './constants';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import apiDocsSetup from './config/swagger.config';
import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: BODY_LIMIT }),
    { bufferLogs: true },
  );

  const log = app.get(Logger);
  app.enableCors();
  app.useLogger(log);
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.enableVersioning({ type: VersioningType.URI });
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  apiDocsSetup(app);
  /*app.useGlobalFilters(new AppExceptionsFilter());*/

  const config = app.get(ConfigService);
  const port = config.get<number>('appPort')!;
  const addr = config.get<string>('appAddr')!;

  await app.listen(port, addr, () => log.log(`Listening on [${addr}:${port}]`));
}
bootstrap();
