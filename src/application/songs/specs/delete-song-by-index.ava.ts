/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';

import { isBusinessError } from 'src/util/business-error';

import { SongQueue } from 'src/domain/songs/entities/song-queue.entity';
import { SongRequestor } from 'src/domain/songs/entities/song-requestor.entity';
import { RequestType, Song } from 'src/domain/songs/entities/songs.entity';
import { songFactory, songQueueFactory, songRequestorFactory } from 'src/domain/songs/songs.factory';

import { baseSetup, BaseTestContenxt } from './application-initializer';

type TestContext = BaseTestContenxt & {
  songs: Song[];
  songQueue: SongQueue;
  requestor: SongRequestor;
}

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  baseSetup(test);

  test.context.requestor = await songRequestorFactory.create();
  test.context.songs = [
    await songFactory.create(),
    await songFactory.create({ requestorName: test.context.requestor.username, requestType: RequestType.ticket }),
    await songFactory.create(),
  ];
  test.context.songQueue = await songQueueFactory.create({
    requestedSongs: test.context.songs,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test.context.songRequestorRepository.getByUsername = sinon.fake(async (username: string) => test.context.requestor);
  test.context.songQueueRepository.get = sinon.fake(async () => test.context.songQueue);
});

test('신청곡을 삭제할 수 있어야 한다.', async (test) => {
  const { application, songQueue, requestor } = test.context;

  const expected = songQueue.requestedSongs.map((song) => song.id);
  const result = await application.deleteSongByIndex(1);

  if (isBusinessError(result)) return test.fail();

  test.is(result.id, expected[1]);
  test.is(songQueue.requestedSongs.length, 2);
  test.is(songQueue.requestedSongs[0].id, expected[0]);
  test.is(songQueue.requestedSongs[1].id, expected[2]);
  test.is(requestor.ticket, 0);
  test.is(requestor.ticketPiece, 0);

  test.is(test.context.songQueueRepository.save.callCount, 1);
  test.is(test.context.songQueueRepository.save.firstCall.args[0].id, songQueue.id);
  test.is(test.context.songRequestorRepository.save.callCount, 0);
});

test('신청곡을 환불할 수 있어야 한다.', async (test) => {
  const { application, songQueue, requestor } = test.context;

  const expected = songQueue.requestedSongs.map((song) => song.id);
  const result = await application.deleteSongByIndex(1, true);

  if (isBusinessError(result)) return test.fail();

  test.is(result.id, expected[1]);
  test.is(songQueue.requestedSongs.length, 2);
  test.is(songQueue.requestedSongs[0].id, expected[0]);
  test.is(songQueue.requestedSongs[1].id, expected[2]);
  test.is(requestor.ticket, 1);
  test.is(requestor.ticketPiece, 0);
});

test('조각으로 신청한 신청곡을 환불할 수 있어야 한다.', async (test) => {
  const { application, songQueue, requestor } = test.context;
  (songQueue.requestedSongs[1].requestType as any) = RequestType.ticketPiece;

  const expected = songQueue.requestedSongs.map((song) => song.id);
  const result = await application.deleteSongByIndex(1, true);

  if (isBusinessError(result)) return test.fail();

  test.is(result.id, expected[1]);
  test.is(songQueue.requestedSongs.length, 2);
  test.is(songQueue.requestedSongs[0].id, expected[0]);
  test.is(songQueue.requestedSongs[1].id, expected[2]);
  test.is(requestor.ticket, 0);
  test.is(requestor.ticketPiece, 3);
});

test('존재하지 않는 신청자가 신청한 신청곡을 환불할 수 없어야 한다.', async (test) => {
  const { application } = test.context;
  (test.context.requestor as any) = null;

  const result = await application.deleteSongByIndex(1, true);

  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'requestor-not-found');
});

test('존재하지 않는 신청곡을 삭제할 수 없어야 한다.', async (test) => {
  const { application } = test.context;

  const result = await application.deleteSongByIndex(999);

  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'out-of-range');
});
