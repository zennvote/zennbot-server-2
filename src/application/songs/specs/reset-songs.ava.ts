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
}

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  baseSetup(test);

  test.context.songQueue = await songQueueFactory.create({
    requestedSongs: [await songFactory.create()],
    consumedSongs: [await songFactory.create()],
  });
  test.context.songQueueRepository.get = sinon.fake(async () => test.context.songQueue);
});

test('신청곡을 초기화할 수 있어야 한다.', async (test) => {
  const { application, songQueue } = test.context;

  const result = await application.resetSongs();

  if (isBusinessError(result)) return test.fail();

  test.is(songQueue.requestedSongs.length, 0);
  test.is(songQueue.consumedSongs.length, 1);

  test.is(test.context.songQueueRepository.save.callCount, 1);
  test.is(test.context.songQueueRepository.save.firstCall.args[0].id, songQueue.id);
});
