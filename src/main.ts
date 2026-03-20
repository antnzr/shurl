import './config/telemetry';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { BODY_LIMIT } from './constants';
import {
  ValidationError,
  flattenValidationErrors,
} from './common/errors/validation.error';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import apiDocsSetup from './config/swagger.config';
import { AppExceptionFilter } from './filter/app.exception-filter';
import { ValidationError as ClassValidatorError } from 'class-validator';
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
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: ':code', method: RequestMethod.GET },
    ],
  });
  app.enableVersioning({ type: VersioningType.URI });
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: false,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ClassValidatorError[]): ValidationError => {
        const fields = flattenValidationErrors(errors);
        return new ValidationError(fields);
      },
    }),
  );

  apiDocsSetup(app);
  app.useGlobalFilters(new AppExceptionFilter());

  const config = app.get(ConfigService);
  const port = config.get<number>('appPort')!;
  const addr = config.get<string>('appAddr')!;

  await app.listen(port, addr, () => log.log(`Listening on [${addr}:${port}]`));
}

bootstrap().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
