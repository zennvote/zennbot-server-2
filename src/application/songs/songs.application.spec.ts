/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as sinon from 'sinon';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import { MockSongQueueRepository } from 'src/infrastructure/persistence/songs/song-queue.mock';
import { MockSongRequestorRepository } from 'src/infrastructure/persistence/songs/song-requestor.mock';
import { MockSongsRepository } from 'src/infrastructure/persistence/songs/songs.mock';

import { SongQueue } from 'src/domain/songs/entities/song-queue.entity';
import { SongRequestor } from 'src/domain/songs/entities/song-requestor.entity';
import { RequestType, Song } from 'src/domain/songs/entities/songs.entity';
import { songFactory, songQueueFactory, songRequestorFactory } from 'src/domain/songs/songs.factory';

import { SongsApplication } from './songs.application';

describe('songs.application', () => {
  let sandbox: sinon.SinonSandbox;
  let application: SongsApplication;

  let songsRepository: MockSongsRepository;
  let songQueueRepository: MockSongQueueRepository;
  let songRequestorRepository: MockSongRequestorRepository;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();

    songsRepository = new MockSongsRepository(sandbox);
    songQueueRepository = new MockSongQueueRepository(sandbox);
    songRequestorRepository = new MockSongRequestorRepository(sandbox);

    application = new SongsApplication(
      songsRepository,
      songQueueRepository,
      songRequestorRepository,
    );
  });

  describe('getSongs', () => {
    it('신청곡 목록을 가져올 수 있어야 한다', async () => {
      const songs = [
        await songFactory.create({ title: 'Test Song 1' }),
        await songFactory.create({ title: 'Test Song 2' }),
        await songFactory.create({ title: 'Test Song 3' }),
      ];
      const songQueue: SongQueue = await songQueueFactory.create({
        requestedSongs: songs,
      });
      songQueueRepository.get = sandbox.fake(async () => songQueue);

      const result = await application.getSongs();

      expect(result.length).toBe(songs.length);
      expect(result[0].id).toBe(songs[0].id);
      expect(result[1].id).toBe(songs[1].id);
      expect(result[2].id).toBe(songs[2].id);
    });
  });

  describe('getCooltimes', () => {
    it('쿨타임 목록을 가져올 수 있어야 한다', async () => {
      const songs = [
        await songFactory.create({ title: 'Test Song 1' }),
        await songFactory.create({ title: 'Test Song 2' }),
        await songFactory.create({ title: 'Test Song 3' }),
      ];
      const songQueue: SongQueue = await songQueueFactory.create({
        consumedSongs: songs,
      });
      songQueueRepository.get = sandbox.fake(async () => songQueue);

      const result = await application.getCooltimes();

      expect(result.length).toBe(songs.length);
      expect(result[0].id).toBe(songs[0].id);
      expect(result[1].id).toBe(songs[1].id);
      expect(result[2].id).toBe(songs[2].id);
    });
  });

  describe('requestSong', () => {
    let songQueue: SongQueue;
    let requestor: SongRequestor;

    beforeEach(async () => {
      songQueue = await songQueueFactory.create();
      requestor = await songRequestorFactory.create({ ticket: 10, ticketPiece: 17 });

      songQueueRepository.get = sandbox.fake(async () => songQueue);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      songRequestorRepository.get = sandbox.fake(async (_: string, __: string) => requestor);
    });

    it('신청곡 신청 및 결제가 완료되어야 한다', async () => {
      const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.title).toBe('Test Song Title');
      expect(result.requestType).toBe(RequestType.ticket);
      expect(songQueue.requestedSongs).toHaveLength(1);
      expect(result.id).toBe(songQueue.requestedSongs[0].id);
      expect(requestor.ticket).toBe(9);

      expect(songsRepository.save.callCount).toBe(1);
      expect(songsRepository.save.firstCall.args[0].id).toBe(result.id);
      expect(songQueueRepository.save.callCount).toBe(1);
      expect(songQueueRepository.save.firstCall.args[0].id).toBe(songQueue.id);
      expect(songRequestorRepository.save.callCount).toBe(1);
      expect(songRequestorRepository.save.firstCall.args[0].id).toBe(requestor.id);
    });

    it('티켓 부족 시 조각을 소모하여 결제되어야 한다', async () => {
      (requestor.ticket as number) = 0;

      const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.title).toBe('Test Song Title');
      expect(result.requestType).toBe(RequestType.ticketPiece);
      expect(songQueue.requestedSongs).toHaveLength(1);
      expect(requestor.ticket).toBe(0);
      expect(requestor.ticketPiece).toBe(14);
    });

    it('골든벨일 시 포인트 소모 없이 신청되어야 한다', async () => {
      (songQueue.isGoldenBellEnabled as boolean) = true;

      const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.title).toBe('Test Song Title');
      expect(result.requestType).toBe(RequestType.freemode);
      expect(songQueue.requestedSongs).toHaveLength(1);
      expect(requestor.ticket).toBe(10);
      expect(requestor.ticketPiece).toBe(17);
    });

    it('티켓이 부족해도 골든벨일 시 신청되어야 한다', async () => {
      (songQueue.isGoldenBellEnabled as boolean) = true;
      (requestor.ticket as number) = 0;
      (requestor.ticketPiece as number) = 0;

      const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.title).toBe('Test Song Title');
      expect(result.requestType).toBe(RequestType.freemode);
      expect(songQueue.requestedSongs).toHaveLength(1);
      expect(requestor.ticket).toBe(0);
      expect(requestor.ticketPiece).toBe(0);
    });

    it('신청 비활성화 시 실패해야 한다', async () => {
      (songQueue.isRequestEnabled as boolean) = false;

      const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

      if (!isBusinessError(result)) throw new Error();

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.error).toBe('request-disabled');
    });

    it('등록되지 않은 시청자일 시 실패해야 한다', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      songRequestorRepository.get = sinon.fake(async (_: string, __: string) => null);

      const result = await application.requestSong('test', 'test', 'Test Song Title');

      if (!isBusinessError(result)) throw new Error();

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.error).toBe('requestor-not-found');
    });

    it('포인트가 모두 부족할 시 실패해야 한다', async () => {
      (requestor.ticket as number) = 0;
      (requestor.ticketPiece as number) = 0;

      const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

      if (!isBusinessError(result)) throw new Error();

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.error).toBe('not-enough-point');
    });

    describe('쿨타임인 경우 실패해야 한다', () => {
      it('신청곡 목록에 쿨타임이 있는 경우', async () => {
        const cooltimeSong = await songFactory.create({ requestorName: requestor.username });
        songQueue.requestedSongs.push(cooltimeSong);

        const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

        if (!isBusinessError(result)) throw new Error();

        expect(result).toBeInstanceOf(BusinessError);
        expect(result.error).toBe('in-cooltime');
      });

      it('제거된 목록에 쿨타임이 있는 경우', async () => {
        const cooltimeSong = await songFactory.create({ requestorName: requestor.username });
        songQueue.consumedSongs.push(cooltimeSong);

        const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

        if (!isBusinessError(result)) throw new Error();

        expect(result).toBeInstanceOf(BusinessError);
        expect(result.error).toBe('in-cooltime');
      });

      it('신청곡 사이에 4개의 곡이 있는 경우', async () => {
        const cooltimeSong = await songFactory.create({ requestorName: requestor.username });
        const songs = await songFactory.createList(4);
        songQueue.requestedSongs.push(cooltimeSong, ...songs);

        const result = await application.requestSong(requestor.twitchId!, requestor.username, 'Test Song Title');

        if (isBusinessError(result)) throw new Error(result.error);

        expect(result.title).toBe('Test Song Title');
        expect(songQueue.requestedSongs).toHaveLength(6);
        expect(result.id).toBe(songQueue.requestedSongs[5].id);
      });
    });
  });

  describe('appendManualSong', () => {
    let songQueue: SongQueue;

    beforeEach(async () => {
      songQueue = await songQueueFactory.create({
        requestedSongs: [
          await songFactory.create({ title: 'Test Song 1' }),
          await songFactory.create({ title: 'Test Song 2' }),
        ],
      });

      songQueueRepository.get = sandbox.fake(async () => songQueue);
    });

    it('신청곡을 추가할 수 있다', async () => {
      const result = await application.appendManualSong('Test Song 3');

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.title).toBe('Test Song 3');
      expect(result.requestType).toBe(RequestType.manual);
      expect(songQueue.requestedSongs).toHaveLength(3);
      expect(result.id).toBe(songQueue.requestedSongs[2].id);

      expect(songsRepository.save.callCount).toBe(1);
      expect(songsRepository.save.firstCall.args[0].id).toBe(result.id);
      expect(songQueueRepository.save.callCount).toBe(1);
      expect(songQueueRepository.save.firstCall.args[0].id).toBe(songQueue.id);
    });

    it('쿨타임 제약 없이 추가할 수 있다', async () => {
      const cooltimeSong = await songFactory.create({ title: 'Cooltime Song', requestorName: '프로듀서_젠' });
      (songQueue.requestedSongs as Song[]) = [cooltimeSong];

      const result = await application.appendManualSong('Test Song 3');

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.title).toBe('Test Song 3');
      expect(result.requestType).toBe(RequestType.manual);
      expect(songQueue.requestedSongs).toHaveLength(2);
      expect(result.id).toBe(songQueue.requestedSongs[1].id);
    });
  });

  describe('reindexSongs', () => {
    let songQueue: SongQueue;
    let songs: Song[];

    beforeEach(async () => {
      songs = await songFactory.createList(3);
      songQueue = await songQueueFactory.create({
        requestedSongs: songs,
      });

      songQueueRepository.get = sandbox.fake(async () => songQueue);
    });

    it('신청곡을 재정렬할 수 있다', async () => {
      const ids = songs.map((song) => song.id);
      const result = await application.reindexSongs([
        songs[2].id, songs[1].id, songs[0].id,
      ]);

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(ids[2]);
      expect(result[1].id).toBe(ids[1]);
      expect(result[2].id).toBe(ids[0]);

      expect(songQueueRepository.save.callCount).toBe(1);
      expect(songQueueRepository.save.firstCall.args[0].id).toBe(songQueue.id);
    });

    it('신청곡 갯수가 맞지 않을 경우 실패해야 한다', async () => {
      const lessResult = await application.reindexSongs([
        songs[2].id, songs[1].id,
      ]);
      const moreResult = await application.reindexSongs([
        songs[2].id, songs[1].id, songs[0].id, songs[0].id,
      ]);

      if (!isBusinessError(lessResult)) throw new Error();
      if (!isBusinessError(moreResult)) throw new Error();

      expect(lessResult).toBeInstanceOf(BusinessError);
      expect(lessResult.error).toBe('invalid-ids');
      expect(moreResult).toBeInstanceOf(BusinessError);
      expect(moreResult.error).toBe('invalid-ids');
    });

    it('잘못된 신청곡 ID가 있을 경우 실패해야 한다', async () => {
      const result = await application.reindexSongs([
        songs[2].id, songs[1].id, songs[0].id, 'invalid-id',
      ]);

      if (!isBusinessError(result)) throw new Error();

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.error).toBe('invalid-ids');
    });
  });

  describe('consumeSong', () => {
    let songQueue: SongQueue;

    beforeEach(async () => {
      songQueue = await songQueueFactory.create({
        requestedSongs: await songFactory.createList(3),
      });

      songQueueRepository.get = sandbox.fake(async () => songQueue);
    });

    it('신청곡을 넘길 수 있다', async () => {
      const expected = songQueue.requestedSongs[0];

      const result = await application.consumeSong();

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.id).toBe(expected.id);
      expect(songQueue.consumedSongs).toHaveLength(1);
      expect(songQueue.consumedSongs[0].id).toBe(expected.id);
      expect(songQueue.requestedSongs).toHaveLength(2);
      expect(songQueue.requestedSongs[0].id).not.toBe(expected.id);

      expect(songsRepository.save.callCount).toBe(1);
      expect(songsRepository.save.firstCall.args[0].id).toBe(expected.id);
      expect(songQueueRepository.save.callCount).toBe(1);
      expect(songQueueRepository.save.firstCall.args[0].id).toBe(songQueue.id);
      expect(songQueueRepository.save.firstCall.args[0].consumedSongs).toHaveLength(1);
    });

    it('쿨타임 큐가 이미 4개일 경우 최상단 곡을 제거해야 한다', async () => {
      const existingCooltimeSongs = await songFactory.createList(4);
      const expected = songQueue.requestedSongs[0];
      (songQueue.consumedSongs as Song[]) = [...existingCooltimeSongs];

      const result = await application.consumeSong();

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.id).toBe(expected.id);
      expect(songQueue.requestedSongs).toHaveLength(2);
      expect(songQueue.consumedSongs).toHaveLength(4);
      expect(songQueue.consumedSongs[0].id).toBe(existingCooltimeSongs[1].id);
      expect(songQueue.consumedSongs[1].id).toBe(existingCooltimeSongs[2].id);
      expect(songQueue.consumedSongs[2].id).toBe(existingCooltimeSongs[3].id);
      expect(songQueue.consumedSongs[3].id).toBe(expected.id);
    });

    it('신청곡이 없을 경우 실패해야 한다', async () => {
      (songQueue.requestedSongs as Song[]) = [];

      const result = await application.consumeSong();

      if (!isBusinessError(result)) throw new Error();

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.error).toBe('empty-queue');
    });
  });

  describe('deleteSongByIndex', () => {
    let songQueue: SongQueue;
    let requestor: SongRequestor;

    beforeEach(async () => {
      requestor = await songRequestorFactory.create();
      songQueue = await songQueueFactory.create({
        requestedSongs: await songFactory.createList(3),
      });

      songQueueRepository.get = sandbox.fake(async () => songQueue);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      songRequestorRepository.getByUsername = sandbox.fake(async (_: string) => requestor);
    });

    it('신청곡을 삭제할 수 있다', async () => {
      const ids = songQueue.requestedSongs.map((song) => song.id);
      const result = await application.deleteSongByIndex(1);

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.id).toBe(ids[1]);
      expect(songQueue.requestedSongs).toHaveLength(2);
      expect(songQueue.requestedSongs[0].id).toBe(ids[0]);
      expect(songQueue.requestedSongs[1].id).toBe(ids[2]);

      expect(songQueueRepository.save.callCount).toBe(1);
      expect(songQueueRepository.save.firstCall.args[0].id).toBe(songQueue.id);
      expect(songRequestorRepository.save.callCount).toBe(0);
    });

    it('신청곡을 환불할 수 있다', async () => {
      const ids = songQueue.requestedSongs.map((song) => song.id);
      const result = await application.deleteSongByIndex(1, true);

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.id).toBe(ids[1]);
      expect(songQueue.requestedSongs).toHaveLength(2);
      expect(songQueue.requestedSongs[0].id).toBe(ids[0]);
      expect(songQueue.requestedSongs[1].id).toBe(ids[2]);
      expect(requestor.ticket).toBe(1);
      expect(requestor.ticketPiece).toBe(0);

      expect(songQueueRepository.save.callCount).toBe(1);
      expect(songQueueRepository.save.firstCall.args[0].id).toBe(songQueue.id);
      expect(songRequestorRepository.save.callCount).toBe(1);
      expect(songRequestorRepository.save.firstCall.args[0].id).toBe(requestor.id);
    });

    it('조각으로 신청한 신청곡을 환불할 수 있다', async () => {
      (songQueue.requestedSongs[1].requestType as RequestType) = RequestType.ticketPiece;

      const ids = songQueue.requestedSongs.map((song) => song.id);
      await songRequestorRepository.save(requestor);

      const result = await application.deleteSongByIndex(1, true);

      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.id).toBe(ids[1]);
      expect(songQueue.requestedSongs).toHaveLength(2);
      expect(songQueue.requestedSongs[0].id).toBe(ids[0]);
      expect(songQueue.requestedSongs[1].id).toBe(ids[2]);
      expect(requestor.ticket).toBe(0);
      expect(requestor.ticketPiece).toBe(3);
    });

    it('존재하지 않는 신청자일 경우 환불할 수 없다', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      songRequestorRepository.getByUsername = sandbox.fake(async (_: string) => null);

      const result = await application.deleteSongByIndex(1, true);

      if (!isBusinessError(result)) throw new Error();

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.error).toBe('requestor-not-found');
    });

    it('존재하지 않는 신청곡일 경우 실패해야 한다', async () => {
      const result = await application.deleteSongByIndex(5);

      if (!isBusinessError(result)) throw new Error();

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.error).toBe('out-of-range');
    });
  });

  describe('resetSongs', () => {
    let songQueue: SongQueue;

    beforeEach(async () => {
      songQueue = await songQueueFactory.create({
        requestedSongs: await songFactory.createList(3),
        consumedSongs: await songFactory.createList(3),
      });

      songQueueRepository.get = sandbox.fake(async () => songQueue);
    });

    it('신청곡을 초기화할 수 있다', async () => {
      const result = await application.resetSongs();

      if (isBusinessError(result)) throw new Error(result.error);

      expect(songQueue.requestedSongs).toHaveLength(0);
      expect(songQueue.consumedSongs).toHaveLength(3);

      expect(songQueueRepository.save.callCount).toBe(1);
      expect(songQueueRepository.save.firstCall.args[0].id).toBe(songQueue.id);
    });
  });

  describe('resetCooltimes', () => {
    let songQueue: SongQueue;

    beforeEach(async () => {
      songQueue = await songQueueFactory.create({
        requestedSongs: await songFactory.createList(3),
        consumedSongs: await songFactory.createList(3),
      });

      songQueueRepository.get = sandbox.fake(async () => songQueue);
    });

    it('쿨타임을 초기화할 수 있다', async () => {
      const result = await application.resetCooltimes();

      if (isBusinessError(result)) throw new Error(result.error);

      expect(songQueue.requestedSongs).toHaveLength(3);
      expect(songQueue.consumedSongs).toHaveLength(0);

      expect(songQueueRepository.save.callCount).toBe(1);
      expect(songQueueRepository.save.firstCall.args[0].id).toBe(songQueue.id);
    });
  });
});
