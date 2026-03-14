import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default function (app: NestFastifyApplication) {
  const builder = new DocumentBuilder()
    .setTitle('Shurl API')
    .setDescription('Url shortening API')
    .build();

  const document = SwaggerModule.createDocument(app, builder);
  SwaggerModule.setup('api/docs', app, document);

  return builder;
}
