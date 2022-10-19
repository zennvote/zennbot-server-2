/* eslint-disable no-param-reassign */

import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import anyTest, { TestFn } from 'ava';
import { sheets_v4 as sheetsV4 } from 'googleapis';
import * as Sinon from 'sinon';

import { PrismaService } from 'src/libs/prisma/prisma.service';
import { SHEETS_CLIENT } from 'src/libs/sheets/sheets.types';
import { commandPayloadFactory } from 'src/libs/tmi/tmi.factory';

import { AppModule } from 'src/app.module';

import { getRowFromIdol, idolFactory } from './idols.factory';

type TestContext = {
  app: INestApplication,
  sheets: sheetsV4.Sheets,
  eventEmitter: EventEmitter2,
  sinon: Sinon.SinonSandbox,
};
const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).overrideProvider(PrismaService)
    .useValue({})
    .overrideProvider(SHEETS_CLIENT)
    .useValue({ spreadsheets: { values: {} } })
    .compile();

  test.context.app = module.createNestApplication();

  await test.context.app.init();
  test.context.sheets = module.get(SHEETS_CLIENT);
  test.context.eventEmitter = module.get(EventEmitter2);
  test.context.sinon = Sinon.createSandbox();
});

test.afterEach.always(async (test) => {
  await test.context.app.close();
  test.context.sinon.restore();
  test.context.sinon.reset();
});

const getResponseFromRow = (row: (string | undefined)[][]) => ({
  data: { values: row },
});

test('COMMAND 랜덤돌 › 랜덤한 아이돌을 출력할 수 있어야 한다.', async (test) => {
  const { sheets, sinon, eventEmitter } = test.context;
  sinon.stub(Math, 'random').returns(0.583);

  const idols = [
    idolFactory.build({ firstName: '사토', lastName: '신' }),
    idolFactory.build({ firstName: '세나', lastName: '시오리' }),
    idolFactory.build({ firstName: '세리자와', lastName: '아사히' }),
    idolFactory.build({ firstName: '세키', lastName: '히로미' }),
    idolFactory.build({ firstName: '소노다', lastName: '치요코' }),
  ];

  const sendStub = sinon.fake();
  sheets.spreadsheets.values.get = sinon.stub().resolves(
    getResponseFromRow(idols.map(getRowFromIdol)),
  );

  const payload = commandPayloadFactory
    .message('!랜덤돌')
    .mockSend(sendStub)
    .build();
  await eventEmitter.emitAsync('command.랜덤돌', payload);

  test.is(sendStub.callCount, 1);
  test.is(sendStub.firstCall.args[0], '랜덤 아이돌의 주인공은 [세리자와 아사히] 입니다!');
});

test('COMMAND 랜덤돌 › 소속사가 제공될 시 해당 소속사에 해당되는 아이돌을 출력할 수 있어야 한다.', async (test) => {
  const { sheets, sinon, eventEmitter } = test.context;
  sinon.stub(Math, 'random').returns(0.114);

  const idols = [
    idolFactory.build({ firstName: '사토', lastName: '신', company: '346' }),
    idolFactory.build({ firstName: '세나', lastName: '시오리', company: '346' }),
    idolFactory.build({ firstName: '세리자와', lastName: '아사히', company: '283' }),
    idolFactory.build({ firstName: '세키', lastName: '히로미', company: '346' }),
    idolFactory.build({ firstName: '소노다', lastName: '치요코', company: '283' }),
  ];

  const sendStub = sinon.fake();
  sheets.spreadsheets.values.get = sinon.stub().resolves(
    getResponseFromRow(idols.map(getRowFromIdol)),
  );

  const payload = commandPayloadFactory
    .message('!랜덤돌 283')
    .mockSend(sendStub)
    .build();
  await eventEmitter.emitAsync('command.랜덤돌', payload);

  test.is(sendStub.callCount, 1);
  test.is(sendStub.firstCall.args[0], '랜덤 아이돌의 주인공은 [세리자와 아사히] 입니다!');
});
