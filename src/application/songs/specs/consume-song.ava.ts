/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';

import { isBusinessError } from 'src/util/business-error';

import Song from 'src/app/songs/songs.entity';

import { SongQueue } from 'src/domain/songs/entities/song-queue.entity';
import { songFactory, songQueueFactory } from 'src/domain/songs/songs.factory';

import { baseSetup, BaseTestContenxt } from './application-initializer';

type TestContext = BaseTestContenxt & {
  song: Song;
  songQueue: SongQueue;
}

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  baseSetup(test);

  test.context.songQueue = await songQueueFactory.create({
    requestedSongs: [await songFactory.create()],
  });
  test.context.songQueueRepository.get = sinon.fake(async () => test.context.songQueue);
});

test('신청곡을 넘길 수 있어야 한다.', async (test) => {
  const { application, songQueue } = test.context;
  const expected = songQueue.requestedSongs[0];

  const result = await application.consumeSong();

  if (isBusinessError(result)) return test.fail();

  test.is(result.id, expected.id);
  test.is(songQueue.requestedSongs.length, 0);
  test.is(songQueue.consumedSongs.length, 1);
  test.is(songQueue.consumedSongs[0].id, result.id);

  test.is(test.context.songsRepository.save.callCount, 1);
  test.is(test.context.songsRepository.save.firstCall.args[0].id, result.id);
  test.is(test.context.songQueueRepository.save.callCount, 1);
  test.is(test.context.songQueueRepository.save.firstCall.args[0].id, songQueue.id);
});

test('쿨타임 큐가 꽉 차있으면 최상단 쿨타임 곡을 제거한다', async (test) => {
  const { application, songQueue } = test.context;
  const expected = songQueue.requestedSongs[0];
  const consumedSongs = [
    await songFactory.create(),
    await songFactory.create(),
    await songFactory.create(),
    await songFactory.create(),
  ];
  (songQueue.consumedSongs as any) = [...consumedSongs];

  const result = await application.consumeSong();

  if (isBusinessError(result)) return test.fail();

  test.is(result.id, expected.id);
  test.is(songQueue.requestedSongs.length, 0);
  test.is(songQueue.consumedSongs.length, 4);
  test.is(songQueue.consumedSongs[0].id, consumedSongs[1].id);
  test.is(songQueue.consumedSongs[1].id, consumedSongs[2].id);
  test.is(songQueue.consumedSongs[2].id, consumedSongs[3].id);
  test.is(songQueue.consumedSongs[3].id, result.id);
});

test('신청곡이 비어있으면 실패해야 한다.', async (test) => {
  const { application, songQueue } = test.context;
  (songQueue.requestedSongs as any) = [];

  const result = await application.consumeSong();

  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'empty-queue');
});
