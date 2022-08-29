import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import test from 'ava';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './libs/prisma/prisma.service';

let app: INestApplication;
let prismaService: PrismaService

test.beforeEach(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = module.createNestApplication();
  prismaService = module.get(PrismaService);

  await app.init();
});

test('sample test', async (t) => {
  const response = await request(app.getHttpServer()).get('/songs');

  t.is(response.status, 200);
  t.deepEqual(response.body, []);
});
