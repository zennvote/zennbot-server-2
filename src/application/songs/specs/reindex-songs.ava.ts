/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';

import { isBusinessError } from 'src/util/business-error';

import { SongQueue } from 'src/domain/songs/entities/song-queue.entity';
import { Song } from 'src/domain/songs/entities/songs.entity';
import { songFactory, songQueueFactory } from 'src/domain/songs/songs.factory';

import { baseSetup, BaseTestContenxt } from './application-initializer';

type TestContext = BaseTestContenxt & {
  songQueue: SongQueue;
  songs: Song[];
};

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  baseSetup(test);

  test.context.songs = [
    await songFactory.create({ title: 'Test Song 1' }),
    await songFactory.create({ title: 'Test Song 2' }),
    await songFactory.create({ title: 'Test Song 3' }),
  ];
  test.context.songQueue = await songQueueFactory.create({
    requestedSongs: test.context.songs,
  });

  test.context.songQueueRepository.get = sinon.fake(async () => test.context.songQueue);
});

test('신청곡 순서를 변경할 수 있어야 한다', async (test) => {
  const { application, songs } = test.context;

  const ids = songs.map((song) => song.id);
  const result = await application.reindexSongs([songs[2].id, songs[1].id, songs[0].id]);

  if (isBusinessError(result)) return test.fail();

  test.is(result[0].id, ids[2]);
  test.is(result[1].id, ids[1]);
  test.is(result[2].id, ids[0]);

  test.is(test.context.songQueueRepository.save.callCount, 1);
  test.is(test.context.songQueueRepository.save.firstCall.args[0].id, test.context.songQueue.id);
});

test('신청곡 갯수가 맞지 않을 경우 에러를 반환해야 한다', async (test) => {
  const { application, songs } = test.context;

  const lessResult = await application.reindexSongs([songs[2].id, songs[0].id]);
  const moreResult = await application.reindexSongs([songs[2].id, songs[1].id, songs[0].id, songs[0].id]);

  if (!isBusinessError(lessResult)) return test.fail();
  if (!isBusinessError(moreResult)) return test.fail();

  test.is(lessResult.error, 'invalid-ids');
  test.is(moreResult.error, 'invalid-ids');
});

test('신청곡 ID가 맞지 않을 경우 에러를 반환해야 한다', async (test) => {
  const { application, songs } = test.context;

  const result = await application.reindexSongs([songs[2].id, songs[1].id, 'invalid-id']);

  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'invalid-ids');
});
