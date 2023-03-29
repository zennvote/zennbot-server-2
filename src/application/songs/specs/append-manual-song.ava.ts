/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';

import { SongQueue } from 'src/domain/songs/entities/song-queue.entity';
import { songFactory, songQueueFactory } from 'src/domain/songs/songs.factory';

import { baseSetup, BaseTestContenxt } from './application-initializer';

type TestContext = BaseTestContenxt & {
  songQueue: SongQueue;
};

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  baseSetup(test);

  test.context.songQueue = await songQueueFactory.create({
    requestedSongs: [
      await songFactory.create({ title: 'Test Song 1' }),
      await songFactory.create({ title: 'Test Song 2' }),
    ],
  });

  test.context.songQueueRepository.get = sinon.fake(async () => test.context.songQueue);
});

test('신청곡을 추가할 수 있어야 한다', async (test) => {
  const { application, songQueue } = test.context;

  const result = await application.appendManualSong('Test Song 3');

  test.is(result.title, 'Test Song 3');
  test.is(songQueue.requestedSongs.length, 3);
  test.is(result.id, songQueue.requestedSongs[2].id);

  test.is(test.context.songQueueRepository.save.callCount, 1);
  test.is(test.context.songQueueRepository.save.firstCall.args[0].id, songQueue.id);
  test.is(test.context.songsRepository.save.callCount, 1);
  test.is(test.context.songsRepository.save.firstCall.args[0].id, result.id);
});

test('쿨타임 제약 없이 추가할 수 있어야 한다', async (test) => {
  const { application, songQueue } = test.context;
  (songQueue.consumedSongs as any) = [
    await songFactory.create({ requestorName: '프로듀서_젠' }),
  ];

  const result = await application.appendManualSong('Test Song 3');

  test.is(result.title, 'Test Song 3');
  test.is(songQueue.requestedSongs.length, 3);
  test.is(result.id, songQueue.requestedSongs[2].id);
});
