/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

import { MockSongsRepository } from 'src/infrastructure/persistence/songs/songs.mock';

import { SongsRepository } from 'src/domain/songs/repositories/songs.repository';

type TestContext = {
  sandbox: SinonSandbox;
  songsRepository: SongsRepository;
};
const test = anyTest as TestFn<TestContext>;

test.beforeEach((test) => {
  const sandbox = sinon.createSandbox();

  test.context.sandbox = sandbox;
  test.context.songsRepository = new MockSongsRepository(sandbox);
});

test.afterEach((test) => {
  test.context.sandbox.restore();
});

test.todo('신청곡 신청이 정상적으로 되어야 한다.');

test.todo('쿨타임 곡 내에 자신의 신청곡이 있을 시 실패해야 한다.');

test.todo('최근 4개 신청곡 내에 자신의 신청곡이 있을 시 실패해야 한다.');

test.todo('신청곡 신청 시 티켓 1개를 소비한다.');

test.todo('신청곡 신청 시 조각 3개를 소비한다.');

test.todo('신청곡 신청 시 두 종류의 포인트를 모두 보유한 경우 티켓을 소비한다.');

test.todo('신청곡 신청 시 두 종류의 포인트를 모두 보유하지 않은 경우 실패해야 한다.');
