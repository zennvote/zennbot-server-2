/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';
import { isBusinessError } from 'src/util/business-error';

import { MockAccountsRepository } from 'src/infrastructure/persistence/accounts/accounts.mock';
import { MockSongsRepository } from 'src/infrastructure/persistence/songs/songs.mock';
import { MockViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.mock';

import { AccountsRepository } from 'src/domain/accounts/accounts.repository';
import { SongsRepository } from 'src/domain/songs/songs.repository';
import { ViewersRepository } from 'src/domain/viewers/viewers.repository';
import { viewerFactory } from 'src/domain/viewers/viewers.factory';
import { accountsFactory } from 'src/domain/accounts/accounts.factory';
import { RequestType, Song, SongProps } from 'src/domain/songs/songs.entity';
import { Account, AccountProps } from 'src/domain/accounts/accounts.entity';

import { songFactory } from 'src/domain/songs/songs.factory';
import { SongsApplication } from '../songs.application';

type TestContext = {
  sandbox: SinonSandbox;
  viewersRepository: ViewersRepository;
  accountsRepository: AccountsRepository;
  songsRepository: SongsRepository;
  application: SongsApplication;
};
const test = anyTest as TestFn<TestContext>;

test.beforeEach((test) => {
  const sandbox = sinon.createSandbox();

  test.context.sandbox = sandbox;
  test.context.viewersRepository = new MockViewersRepository(sandbox);
  test.context.accountsRepository = new MockAccountsRepository(sandbox);
  test.context.songsRepository = new MockSongsRepository(sandbox);

  test.context.application = new SongsApplication(
    test.context.viewersRepository as any,
    test.context.accountsRepository as any,
    test.context.songsRepository as any,
  );
});

test.afterEach((test) => {
  test.context.sandbox.restore();
});

test('신청곡 신청 및 결제가 완료되어야 한다', async (test) => {
  const { sandbox, application } = test.context;

  const viewer = await viewerFactory.create();
  const account = await accountsFactory.create({
    twitchId: viewer.twitchId,
    username: viewer.username,
    ticket: 10,
  });
  test.context.viewersRepository.findOne = sandbox.fake.resolves(viewer);
  test.context.accountsRepository.findByTwitchIdAndUsername = sandbox.fake.resolves(account);
  test.context.songsRepository.save = sandbox.fake(async (song) => {
    (song.id as any) = 3;
    return song;
  });

  const result = await application.requestSong(viewer.twitchId, viewer.username, 'test song');

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.true(result instanceof Song);
  test.true(result.persisted);

  // Test Persistence
  const saveSong =
    test.context.songsRepository.save as sinon.SinonSpy<[Song], Promise<Song>>;
  const saveAccount =
    test.context.accountsRepository.save as sinon.SinonSpy<[Account], Promise<Account>>;

  test.true(saveSong.called);
  test.like<Partial<SongProps>>(
    saveSong.firstCall.args[0],
    {
      title: 'test song',
      requestorId: viewer.id,
      requestType: RequestType.ticket,
    },
  );
  test.true(saveAccount.called);
  test.like<Partial<AccountProps>>(
    saveAccount.firstCall.args[0],
    { id: account.id, ticket: 9 },
  );
});

test('조각을 통한 신청곡 신청 및 결제가 완료되어야 한다', async (test) => {
  const { sandbox, application } = test.context;

  const viewer = await viewerFactory.create();
  const account = await accountsFactory.create({
    twitchId: viewer.twitchId,
    username: viewer.username,
    ticketPiece: 10,
  });
  test.context.viewersRepository.findOne = sandbox.fake.resolves(viewer);
  test.context.accountsRepository.findByTwitchIdAndUsername = sandbox.fake.resolves(account);
  test.context.songsRepository.save = sandbox.fake(async (song) => {
    (song.id as any) = 3;
    return song;
  });

  const result = await application.requestSong(viewer.twitchId, viewer.username, 'test song');

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.is(result.requestType, RequestType.ticketPiece);
});

test('존재하지 않는 시청자의 경우 실패해야 한다.', async (test) => {
  const { application } = test.context;

  const result = await application.requestSong('no-user', 'no-user', 'test song');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'no-viewer');
});

test('Account가 존재하지 않는 시청자의 경우 실패해야 한다.', async (test) => {
  const { sandbox, application } = test.context;

  const viewer = await viewerFactory.create();
  test.context.viewersRepository.findOne = sandbox.fake.resolves(viewer);

  const result = await application.requestSong('no-user', 'no-user', 'test song');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'no-account');
});

test('포인트가 부족한 경우 실패해야 한다.', async (test) => {
  const { sandbox, application } = test.context;

  const viewer = await viewerFactory.create();
  const account = await accountsFactory.create({
    twitchId: viewer.twitchId,
    username: viewer.username,
  });
  test.context.viewersRepository.findOne = sandbox.fake.resolves(viewer);
  test.context.accountsRepository.findByTwitchIdAndUsername = sandbox.fake.resolves(account);

  const result = await application.requestSong('no-user', 'no-user', 'test song');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'not-enough-point');
});

test('쿨타임인 경우 실패해야 한다.', async (test) => {
  const { sandbox, application } = test.context;

  const viewer = await viewerFactory.create();
  const account = await accountsFactory.create({
    twitchId: viewer.twitchId,
    username: viewer.username,
    ticket: 10,
  });
  test.context.viewersRepository.findOne = sandbox.fake.resolves(viewer);
  test.context.accountsRepository.findByTwitchIdAndUsername = sandbox.fake.resolves(account);
  test.context.songsRepository.getCooltimeSongs = sandbox.fake.resolves(
    [await songFactory.create({ requestorId: viewer.id })],
  );
  test.context.songsRepository.save = sandbox.fake(async (song) => {
    (song.id as any) = 3;
    return song;
  });

  const result = await application.requestSong(viewer.twitchId, viewer.username, 'test song');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'in-cooltime');
});
