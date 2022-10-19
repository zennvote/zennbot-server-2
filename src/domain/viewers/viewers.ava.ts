/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

import { isBusinessError } from 'src/util/business-error';

import { MockSongsRepository } from 'src/infrastructure/persistence/songs/songs.mock';

import { RequestType, Song, SongProps } from 'src/domain/songs/songs.entity';
import { songFactory } from 'src/domain/songs/songs.factory';
import { SongsRepository } from 'src/domain/songs/songs.repository';
import { SongsService } from 'src/domain/songs/songs.service';

import { viewerFactory } from './viewers.factory';

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

test('신청곡 신청이 정상적으로 되어야 한다.', async (test) => {
  const { songsRepository } = test.context;

  const viewer = await viewerFactory.create();
  const songsService = new SongsService(songsRepository);

  const result = await viewer.requestSong('test song', RequestType.ticket, songsService);

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.true(result instanceof Song);
  test.like<SongProps>(result, {
    id: -1,
    title: 'test song',
    requestorId: viewer.id,
    requestType: RequestType.ticket,
  });
});

test('쿨타임 곡 내에 자신의 신청곡이 있을 시 실패해야 한다.', async (test) => {
  const { sandbox, songsRepository } = test.context;

  const viewerId = 10;
  songsRepository.getCooltimeSongs = sandbox.fake.resolves([
    await songFactory.create({ requestorId: viewerId }),
    await songFactory.create(),
    await songFactory.create(),
    await songFactory.create(),
  ]);

  const viewer = await viewerFactory.create({ id: viewerId });
  const songsService = new SongsService(songsRepository);

  const result = await viewer.requestSong('fail song', RequestType.ticket, songsService);

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'in-cooltime');
});

test('최근 4개 신청곡 내에 자신의 신청곡이 있을 시 실패해야 한다.', async (test) => {
  const { sandbox, songsRepository } = test.context;

  const viewerId = 10;
  songsRepository.getCooltimeSongs = sandbox.fake.resolves([
    await songFactory.create(),
    await songFactory.create(),
    await songFactory.create({ requestorId: viewerId }),
    await songFactory.create(),
    await songFactory.create(),
  ]);

  const viewer = await viewerFactory.create({ id: viewerId });
  const songsService = new SongsService(songsRepository);

  const result = await viewer.requestSong('fail song', RequestType.ticket, songsService);

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'in-cooltime');
});
