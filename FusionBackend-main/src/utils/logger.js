/**
 * Structured logger.
 *
 * In development we use pino-pretty for human-readable output. In production
 * we emit raw NDJSON so log aggregators (Datadog, Loki, CloudWatch) can parse it.
 *
 * Use child loggers (`logger.child({ component: 'webhook' })`) so every line
 * carries the originating component for free.
 */
import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  base: { service: 'fusion-backend' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.update_token',
      '*.client_secret',
    ],
    censor: '[REDACTED]',
  },
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname,service',
        },
      },
});

export default logger;
