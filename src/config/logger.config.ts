import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Params } from 'nestjs-pino';
import { Environment, SHURL_TITLE } from '../constants';

export default function (config: ConfigService): Params {
  const nodeEnv = config.get<string>('nodeEnv');
  const level =
    nodeEnv === Environment.Prod
      ? 'info'
      : nodeEnv === Environment.Test
        ? 'error'
        : 'debug';

  const isDev = config.get<string>('nodeEnv') === Environment.Dev;
  const transport = isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, colorizeObjects: true },
      }
    : undefined;

  const serializers = isDev
    ? {
        req(req: FastifyRequest) {
          return { method: req.method, url: req.url };
        },
        res(res: FastifyReply) {
          return { status: res.statusCode };
        },
      }
    : undefined;
  return {
    pinoHttp: {
      level,
      transport,
      serializers,
      name: SHURL_TITLE,
      redact: {
        censor: '🤫',
        paths: [
          'incoming.text',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
          'req.headers.authorization',
        ],
      },
      formatters: { level: (label: string | number) => ({ level: label }) },
    },
  };
}
