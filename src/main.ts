import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';

import { AppModule } from './app.module';
import { SentryInterceptor } from './sentry.interceptor';
import { MainLogger } from './util/logger';
import { setupSwagger } from './util/swagger';

async function bootstrap() {
  const productionTransports = process.env.NODE_ENV === 'production'
    ? [new LogtailTransport(new Logtail(process.env.LOGTAIL_SOURCE_TOKEN ?? ''), { level: 'debug' })]
    : [];

  const app = await NestFactory.create(AppModule, {
    logger: new MainLogger(undefined, productionTransports),
  });

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });

  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new SentryInterceptor());

  setupSwagger(app);

  const port = process.env.PORT;
  await app.listen(port ?? 3000);
}
bootstrap();
