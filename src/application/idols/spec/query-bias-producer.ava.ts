/* eslint-disable no-param-reassign */

import anyTest, { ExecutionContext, TestFn } from 'ava';
import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

import { isBusinessError } from 'src/util/business-error';

import { MockIdolsRepository } from 'src/infrastructure/persistence/idols/idols.mock';
import { MockViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.mock';

import { idolsFactory } from 'src/domain/idols/idols.factory';
import { viewerFactory } from 'src/domain/viewers/viewers.factory';

import { IdolsApplication } from '../idols.application';

type TestContext = {
  sandbox: SinonSandbox;
  application: IdolsApplication;
  idolsRepository: MockIdolsRepository;
  viewersRepository: MockViewersRepository;
}
const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  const sandbox = sinon.createSandbox();

  test.context.sandbox = sandbox;
  test.context.idolsRepository = new MockIdolsRepository(sandbox);
  test.context.viewersRepository = new MockViewersRepository(sandbox);

  test.context.application = new IdolsApplication(
    test.context.idolsRepository as any,
    test.context.viewersRepository as any,
  );

  await setupDefaultCase(test);
});

test.afterEach((test) => test.context.sandbox.restore());

const setupDefaultCase = async (test: ExecutionContext<TestContext>) => {
  const { sandbox } = test.context;

  const idol = await idolsFactory.create({
    firstName: '오오츠키',
    lastName: '유이',
  });
  test.context.idolsRepository.findByKeyword = sandbox.fake.resolves([idol]);
  test.context.viewersRepository.findByBiasIdols = sandbox.fake.resolves([
    await viewerFactory.create({ username: '라떼락대' }),
    await viewerFactory.create({ username: '리하즈' }),
  ]);
};

test('아이돌의 담당 프로듀서 리스트를 조회할 수 있어야 한다.', async (test) => {
  const { application } = test.context;

  const result = await application.queryBiasProducer('유이');

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  const sorted = result.sort((a, b) => a.username.localeCompare(b.username));
  test.like(sorted[0], { username: '라떼락대' });
  test.like(sorted[1], { username: '리하즈' });
});

test('해당하는 아이돌이 두명 이상일 경우 실패해야 한다.', async (test) => {
  const { sandbox, application } = test.context;

  test.context.idolsRepository.findByKeyword = sandbox.fake.resolves([
    await idolsFactory.create({ firstName: '카미야', lastName: '나오' }),
    await idolsFactory.create({ firstName: '오카무라', lastName: '나오' }),
    await idolsFactory.create({ firstName: '요코야마', lastName: '나오' }),
  ]);

  const result = await application.queryBiasProducer('나오');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'multiple-idol');
});

test('해당하는 아이돌이 없을 경우 실패해야 한다.', async (test) => {
  const { sandbox, application } = test.context;

  test.context.idolsRepository.findByKeyword = sandbox.fake.resolves([]);

  const result = await application.queryBiasProducer('no-idol');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'no-idol');
});
