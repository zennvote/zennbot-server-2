/* eslint-disable no-param-reassign */

import { INestApplication } from '@nestjs/common';
import anyTest, { TestFn } from 'ava';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { Test } from '@nestjs/testing';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { transactionalTest } from 'src/util/test/test-transactional';

type TestContext = {
  app: INestApplication,
  prisma: PrismaService,
};
const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).overrideProvider(PrismaService).useValue({}).compile();

  test.context.app = module.createNestApplication();
  test.context.prisma = module.get(PrismaService);

  await test.context.app.init();
});

test('유저를 생성할 수 있어야 한다.', async (test) => {
  const { app, prisma } = test.context;

  await transactionalTest(prisma, async () => {
    const body = { username: 'username1', password: 'password1' };
    const response = await request(app.getHttpServer()).post('/users').send(body);

    test.is(response.status, 201);
    test.deepEqual(response.body.username, 'username1');

    const actual = await prisma.user.findFirst({ where: { username: 'username1' } });
    const passwordCompare = await bcrypt.compare('password1', actual?.password ?? '');

    test.is(actual?.username, 'username1');
    test.true(passwordCompare);
  });
});
