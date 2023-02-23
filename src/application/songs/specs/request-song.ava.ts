/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import anyTest, { ExecutionContext, TestFn } from 'ava';
import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

import { isBusinessError } from 'src/util/business-error';

import { MockSettingsRepository } from 'src/infrastructure/persistence/settings/settings.mock';
import { MockSongsRepository } from 'src/infrastructure/persistence/songs/songs.mock';
import { MockViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.mock';

import { IsGoldenbellEnabled, IsRequestEnabled } from 'src/domain/settings/settings-store';
import { RequestType, Song, SongProps } from 'src/domain/songs/entities/songs.entity';
import { songFactory } from 'src/domain/songs/songs.factory';
import { Viewer, ViewerProps } from 'src/domain/viewers/viewers.entity';
import { viewerFactory } from 'src/domain/viewers/viewers.factory';

import { SongsApplication } from '../songs.application';

type TestContext = {
  sandbox: SinonSandbox;
  viewersRepository: MockViewersRepository;
  songsRepository: MockSongsRepository;
  settingsRepository: MockSettingsRepository;
  application: SongsApplication;
  viewer: Viewer;
};
const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  const sandbox = sinon.createSandbox();

  test.context.sandbox = sandbox;
  test.context.viewersRepository = new MockViewersRepository(sandbox);
  test.context.songsRepository = new MockSongsRepository(sandbox);
  test.context.settingsRepository = new MockSettingsRepository(sandbox);

  test.context.application = new SongsApplication(
    test.context.viewersRepository as any,
    test.context.songsRepository as any,
    test.context.settingsRepository as any,
  );

  await setupDefaultCase(test);
});

test.afterEach((test) => {
  test.context.sandbox.restore();
});

const setupDefaultCase = async (test: ExecutionContext<TestContext>) => {
  const { sandbox } = test.context;

  const viewer = await viewerFactory.create({ ticket: 10 });

  test.context.viewer = viewer;

  test.context.viewersRepository.findOne = sandbox.fake(async () => test.context.viewer);
  test.context.songsRepository.save = sandbox.fake(async (song) => {
    (song.id as any) = 3;
    return song;
  });
};

test('신청곡 신청 및 결제가 완료되어야 한다', async (test) => {
  const { application, viewer } = test.context;

  const result = await application.requestSong(viewer.twitchId!, viewer.username, 'test song');

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.true(result instanceof Song);
  test.true(result.persisted);

  // Test Persistence
  const saveSong =
    test.context.songsRepository.save as sinon.SinonSpy<[Song], Promise<Song>>;
  const saveViewer =
    test.context.viewersRepository.save as sinon.SinonSpy<[Viewer], Promise<Viewer>>;

  test.true(saveSong.called);
  test.like<Partial<SongProps>>(
    saveSong.firstCall.args[0],
    {
      title: 'test song',
      requestorId: viewer.id,
      requestType: RequestType.ticket,
    },
  );
  test.true(saveViewer.called);
  test.like<Partial<ViewerProps>>(
    saveViewer.firstCall.args[0],
    { id: viewer.id, ticket: 9 },
  );
});

test('조각을 통한 신청곡 신청 및 결제가 완료되어야 한다', async (test) => {
  const { application } = test.context;

  const viewer = await viewerFactory.create({ ticketPiece: 10 });
  test.context.viewer = viewer;

  const result = await application.requestSong(viewer.twitchId!, viewer.username, 'test song');

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.is(result.requestType, RequestType.ticketPiece);
});

test('골든벨일 시 포인트 소모 없이 신청되어야 한다', async (test) => {
  const { application } = test.context;

  const viewer = await viewerFactory.create({
    ticket: 3,
    ticketPiece: 10,
  });
  test.context.viewer = viewer;
  test.context.settingsRepository.MockSettings[IsGoldenbellEnabled] = true;

  const result = await application.requestSong(viewer.twitchId!, viewer.username, 'test song');

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.is(result.requestType, RequestType.freemode);
  test.is(viewer.ticket, 3);
  test.is(viewer.ticketPiece, 10);
});

test('신청 비활성화 시 실패해야 한다', async (test) => {
  const { application, viewer } = test.context;

  test.context.settingsRepository.MockSettings[IsRequestEnabled] = false;

  const result = await application.requestSong(viewer.twitchId!, viewer.username, 'test song');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'request-not-enabled');
});

test('존재하지 않는 시청자의 경우 실패해야 한다.', async (test) => {
  const { sandbox, application } = test.context;

  test.context.viewersRepository.findOne = sandbox.fake.resolves(null);

  const result = await application.requestSong('no-user', 'no-user', 'test song');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'no-viewer');
});

test('포인트가 부족한 경우 실패해야 한다.', async (test) => {
  const { sandbox, application } = test.context;

  const viewer = await viewerFactory.create();
  test.context.viewersRepository.findOne = sandbox.fake.resolves(viewer);

  const result = await application.requestSong(viewer.twitchId!, viewer.username, 'test song');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'not-enough-point');
});

test('골든벨일 경우 포인트가 부족해도 신청 가능해야 한다.', async (test) => {
  const { sandbox, application } = test.context;

  const viewer = await viewerFactory.create();
  test.context.viewersRepository.findOne = sandbox.fake.resolves(viewer);
  test.context.settingsRepository.MockSettings[IsGoldenbellEnabled] = true;

  const result = await application.requestSong(viewer.twitchId!, viewer.username, 'test song');

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.is(result.requestType, RequestType.freemode);
});

test('쿨타임인 경우 실패해야 한다.', async (test) => {
  const { sandbox, application, viewer } = test.context;

  test.context.songsRepository.getCooltimeSongs = sandbox.fake.resolves(
    [await songFactory.create({ requestorId: viewer.id })],
  );

  const result = await application.requestSong(viewer.twitchId!, viewer.username, 'test song');

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'in-cooltime');
});
