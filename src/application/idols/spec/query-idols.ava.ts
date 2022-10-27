/* eslint-disable no-param-reassign */

import anyTest, { ExecutionContext, TestFn } from 'ava';
import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

import { MockIdolsRepository } from 'src/infrastructure/persistence/idols/idols.mock';
import { MockViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.mock';

import { idolsFactory } from 'src/domain/idols/idols.factory';

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

  test.context.idolsRepository.all = sandbox.fake.resolves([
    await idolsFactory.create({ firstName: '오오츠키', lastName: '유이' }),
    await idolsFactory.create({ firstName: '유메미', lastName: '리아무' }),
  ]);
};

test('아이돌 리스트를 조회할 수 있어야 한다.', async (test) => {
  const { application } = test.context;

  const result = await application.queryIdols();

  const sorted = result.sort((a, b) => a.fullName.localeCompare(b.fullName));
  test.is(sorted[0].fullName, '오오츠키 유이');
  test.is(sorted[1].fullName, '유메미 리아무');
});
