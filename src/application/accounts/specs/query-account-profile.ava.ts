/* eslint-disable no-param-reassign */

import anyTest, { ExecutionContext, TestFn } from 'ava';
import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

import { isBusinessError } from 'src/util/business-error';

import { MockAccountsRepository } from 'src/infrastructure/persistence/accounts/accounts.mock';
import { MockViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.mock';

import { Account } from 'src/domain/accounts/accounts.entity';
import { accountsFactory } from 'src/domain/accounts/accounts.factory';
import { Viewer } from 'src/domain/viewers/viewers.entity';
import { viewerFactory } from 'src/domain/viewers/viewers.factory';

import { AccountsApplication } from '../accounts.application';

type TestContext = {
  sandbox: SinonSandbox;
  viewersRepository: MockViewersRepository;
  accountsRepository: MockAccountsRepository;
  application: AccountsApplication;
  viewer: Viewer;
  account: Account;
}
const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  const sandbox = sinon.createSandbox();

  test.context.sandbox = sandbox;
  test.context.viewersRepository = new MockViewersRepository(sandbox);
  test.context.accountsRepository = new MockAccountsRepository(sandbox);

  test.context.application = new AccountsApplication(
    test.context.viewersRepository as any,
    test.context.accountsRepository as any,
  );

  await setupDefaultCase(test);
});

test.afterEach((test) => test.context.sandbox.restore());

const setupDefaultCase = async (test: ExecutionContext<TestContext>) => {
  const { sandbox } = test.context;

  test.context.viewer = await viewerFactory.create({ accountId: 7 });
  test.context.account = await accountsFactory.create({
    id: 7,
    twitchId: test.context.viewer.twitchId,
    username: test.context.viewer.username,
    ticket: 2,
    ticketPiece: 12,
  });

  test.context.viewersRepository.findOne = sandbox.fake(async () => test.context.viewer);
  test.context.accountsRepository.find = sandbox.fake(async () => test.context.account);
};

test('보유 포인트 정보를 조회할 수 있어야 한다.', async (test) => {
  const { application, viewer, account } = test.context;

  const result = await application.queryAccountProfile(viewer.twitchId, viewer.username);

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.true(result.account instanceof Account);
  test.is(result.account.id, account.id);
});

test('시청자가 존재하지 않을 시 실패해야한다.', async (test) => {
  const { application, sandbox } = test.context;

  test.context.viewersRepository.findOne = sandbox.fake.resolves(null);

  const result = await application.queryAccountProfile('no-viewer', 'no-viewer');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'no-viewer');
});

test('시청자 포인트 정보가 존재하지 않을 시 실패해야한다.', async (test) => {
  const { application, sandbox, viewer } = test.context;

  test.context.accountsRepository.find = sandbox.fake.resolves(null);

  const result = await application.queryAccountProfile(viewer.twitchId, viewer.username);

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'no-account');
});
