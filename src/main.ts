import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { BODY_LIMIT } from './constants';

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

/*app.useGlobalFilters(new AppExceptionsFilter());
  apiDocsSetup(app); */

  const config = app.get(ConfigService);
  const port = config.get<number>('appPort')!;
  const addr = config.get<string>('appAddr')!;

  await app.listen(port, addr, () => log.log(`Listening on [${addr}:${port}]`));
}
bootstrap();
