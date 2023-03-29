/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';

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

test('신청곡 목록을 가져올 수 있어야 한다', async (test) => {
  const { application, songs } = test.context;

  const result = await application.getSongs();

  test.is(result.length, songs.length);
  test.is(result[0].id, songs[0].id);
  test.is(result[1].id, songs[1].id);
  test.is(result[2].id, songs[2].id);
});
