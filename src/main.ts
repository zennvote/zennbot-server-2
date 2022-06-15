import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './util/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  setupSwagger(app);

  const port = process.env.PORT;
  await app.listen(port);
}
bootstrap();
