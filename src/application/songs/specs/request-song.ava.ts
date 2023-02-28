/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import anyTest, { TestFn } from 'ava';
import * as sinon from 'sinon';

import { isBusinessError } from 'src/util/business-error';

import { SongQueue } from 'src/domain/songs/entities/song-queue.entity';
import { SongRequestor } from 'src/domain/songs/entities/song-requestor.entity';
import { RequestType } from 'src/domain/songs/entities/songs.entity';
import { songFactory, songQueueFactory, songRequestorFactory } from 'src/domain/songs/songs.factory';

import { baseSetup, BaseTestContenxt } from './application-initializer';

type TestContext = BaseTestContenxt & {
  songQueue: SongQueue;
  requestor: SongRequestor;
};

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (test) => {
  baseSetup(test);

  test.context.songQueue = await songQueueFactory.create();
  test.context.songQueueRepository.get = sinon.fake(async () => test.context.songQueue);

  test.context.requestor = await songRequestorFactory.create({
    ticket: 10,
    ticketPiece: 17,
  });
  test.context.songRequestorRepository.get = sinon.fake(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (twitchId: string, username: string) => test.context.requestor,
  );
});

test('신청곡 신청 및 결제가 완료되어야 한다', async (test) => {
  const { application, songQueue, requestor } = test.context;

  const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

  if (isBusinessError(result)) return test.fail();

  test.is(result.title, 'Test Song Title');
  test.is(result.requestType, RequestType.ticket);
  test.is(songQueue.requestedSongs.length, 1);
  test.is(result.id, songQueue.requestedSongs[0].id);
  test.is(requestor.ticket, 9);

  test.is(test.context.songsRepository.save.callCount, 1);
  test.is(test.context.songsRepository.save.firstCall.args[0].id, result.id);
  test.is(test.context.songQueueRepository.save.callCount, 1);
  test.is(test.context.songQueueRepository.save.firstCall.args[0].id, songQueue.id);
  test.is(test.context.songRequestorRepository.save.callCount, 1);
  test.is(test.context.songRequestorRepository.save.firstCall.args[0].id, requestor.id);
});

test('조각을 통한 신청곡 신청 및 결제가 완료되어야 한다', async (test) => {
  const { application, songQueue, requestor } = test.context;
  (test.context.requestor.ticket as any) = 0;

  const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

  if (isBusinessError(result)) return test.fail();

  test.is(result.title, 'Test Song Title');
  test.is(result.requestType, RequestType.ticketPiece);
  test.is(songQueue.requestedSongs.length, 1);
  test.is(requestor.ticket, 0);
  test.is(requestor.ticketPiece, 14);
});

test('골든벨일 시 포인트 소모 없이 신청되어야 한다', async (test) => {
  const { application, songQueue, requestor } = test.context;
  (test.context.songQueue.isGoldenBellEnabled as any) = true;

  const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

  if (isBusinessError(result)) return test.fail();

  test.is(result.title, 'Test Song Title');
  test.is(result.requestType, RequestType.freemode);
  test.is(songQueue.requestedSongs.length, 1);
  test.is(requestor.ticket, 10);
  test.is(requestor.ticketPiece, 17);
});

test('신청 비활성화 시 실패해야 한다', async (test) => {
  const { application, requestor } = test.context;
  (test.context.songQueue.isRequestEnabled as any) = false;

  const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'request-disabled');
});

test('존재하지 않는 시청자의 경우 실패해야 한다.', async (test) => {
  const { application } = test.context;
  (test.context.songRequestorRepository.get as any) = sinon.fake(async () => null);

  const result = await application.requestSong('test', 'test', 'Test Song Title');

  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'requestor-not-found');
});

test('포인트가 부족한 경우 실패해야 한다.', async (test) => {
  const { application, requestor } = test.context;
  (test.context.requestor.ticket as any) = 0;
  (test.context.requestor.ticketPiece as any) = 0;

  const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'not-enough-point');
});

test('골든벨일 경우 포인트가 부족해도 신청 가능해야 한다.', async (test) => {
  const { application, requestor, songQueue } = test.context;
  (test.context.requestor.ticket as any) = 0;
  (test.context.requestor.ticketPiece as any) = 0;
  (test.context.songQueue.isGoldenBellEnabled as any) = true;

  const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

  if (isBusinessError(result)) return test.fail();

  test.is(result.title, 'Test Song Title');
  test.is(result.requestType, RequestType.freemode);
  test.is(songQueue.requestedSongs.length, 1);
  test.is(requestor.ticket, 0);
  test.is(requestor.ticketPiece, 0);
});

test('쿨타임인 경우 실패해야 한다.', async (test) => {
  const { application, requestor } = test.context;
  const cooltimeSong = await songFactory.create({ requestorId: requestor.twitchId });
  test.context.songQueue.consumedSongs.push(cooltimeSong);

  const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'in-cooltime');
});
