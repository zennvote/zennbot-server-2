import { Test, TestingModule } from '@nestjs/testing';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import Song, { RequestType } from './songs.entity';
import { SongsRepository } from './songs.repository';
import { SongsService } from './songs.service';

describe('SongsService', () => {
  let service: SongsService;
  let repository: SongsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SongsService, { provide: SongsRepository, useValue: {} }],
    }).compile();

    service = module.get<SongsService>(SongsService);
    repository = module.get<SongsRepository>(SongsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('getSongs', () => {
    it('신청곡 목록을 반환해야 한다.', async () => {
      repository.getRequestedSongs = jest.fn(
        async (): Promise<Song[]> => [new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket)],
      );

      const result = await service.getSongs();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('test song 1');
      expect(result[0].requestor).toBe('viewer1');
      expect(result[0].requestorName).toBe('시청자1');
      expect(result[0].requestType).toBe(RequestType.ticket);
    });
  });

  describe('getCooltimeSongs', () => {
    it('신청곡 목록을 반환해야 한다.', async () => {
      repository.getCooltimeSongs = jest.fn(
        async (): Promise<Song[]> => [new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket)],
      );

      const result = await service.getCooltimeSongs();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('test song 1');
      expect(result[0].requestor).toBe('viewer1');
      expect(result[0].requestorName).toBe('시청자1');
      expect(result[0].requestType).toBe(RequestType.ticket);
    });
  });

  describe('skipSong', () => {
    it('첫번째 신청곡을 제거하여 쿨타임곡 최하단에 삽입한다.', async () => {
      repository.getCooltimeSongs = jest.fn(async () => [
        new Song('cooltime song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('cooltime song 2', 'viewer2', '시청자2', RequestType.ticket),
      ]);
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('target song', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song', 'viewer2', '시청자2', RequestType.ticket),
      ]);
      repository.setCooltimeSongs = jest.fn();
      repository.setRequestedSongs = jest.fn();

      const result = await service.skipSong();

      expect(isBusinessError(result)).toBe(false);
      if (isBusinessError(result)) {
        return;
      }
      expect(result.title).toBe('target song');
      expect(repository.setCooltimeSongs).toBeCalledWith([
        new Song('cooltime song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('cooltime song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('target song', 'viewer1', '시청자1', RequestType.ticket),
      ]);
      expect(repository.setRequestedSongs).toBeCalledWith([
        new Song('test song', 'viewer2', '시청자2', RequestType.ticket),
      ]);
    });

    it('쿨타임이 꽉 찼을 경우 최상단 쿨타임 곡을 제거한다.', async () => {
      repository.getCooltimeSongs = jest.fn(async () => [
        new Song('cooltime song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('cooltime song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('cooltime song 3', 'viewer3', '시청자3', RequestType.ticket),
        new Song('cooltime song 4', 'viewer4', '시청자4', RequestType.ticket),
      ]);
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('target song', 'viewer1', '시청자1', RequestType.ticket),
      ]);
      repository.setCooltimeSongs = jest.fn();
      repository.setRequestedSongs = jest.fn();

      const result = await service.skipSong();

      expect(isBusinessError(result)).toBe(false);
      if (isBusinessError(result)) {
        return;
      }
      expect(result.title).toBe('target song');
      expect(repository.setCooltimeSongs).toBeCalledWith([
        new Song('cooltime song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('cooltime song 3', 'viewer3', '시청자3', RequestType.ticket),
        new Song('cooltime song 4', 'viewer4', '시청자4', RequestType.ticket),
        new Song('target song', 'viewer1', '시청자1', RequestType.ticket),
      ]);
      expect(repository.setRequestedSongs).toBeCalledWith([]);
    });

    it('비어있는 상태에서 넘길 경우 에러를 발생시켜야 한다.', async () => {
      repository.getCooltimeSongs = jest.fn(async () => [
        new Song('cooltime song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('cooltime song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('cooltime song 3', 'viewer3', '시청자3', RequestType.ticket),
        new Song('cooltime song 4', 'viewer4', '시청자4', RequestType.ticket),
      ]);
      repository.getRequestedSongs = jest.fn(async () => []);
      repository.setCooltimeSongs = jest.fn();
      repository.setRequestedSongs = jest.fn();

      const result = await service.skipSong();

      expect(isBusinessError(result)).toBe(true);
      if (!isBusinessError(result)) {
        return;
      }
      expect(result.error).toBe('empty-list');
      expect(repository.setCooltimeSongs).not.toBeCalled();
      expect(repository.setRequestedSongs).not.toBeCalled();
    });
  });

  describe('resetSongs', () => {
    it('신청곡 목록 및 쿨타임 목록을 비워야 한다', async () => {
      repository.setRequestedSongs = jest.fn();
      repository.setCooltimeSongs = jest.fn();

      await service.resetSongs();

      expect(repository.setRequestedSongs).toBeCalledWith([]);
      expect(repository.setCooltimeSongs).toBeCalledWith([]);
    });
  });

  describe('resetCooltimeSongs', () => {
    it('쿨타임 목록을 비워야 한다', async () => {
      repository.setCooltimeSongs = jest.fn();

      await service.resetCooltimeSongs();

      expect(repository.setCooltimeSongs).toBeCalledWith([]);
    });
  });

  describe('resetRequestedSongs', () => {
    it('신청곡 목록을 비워야 한다', async () => {
      repository.setRequestedSongs = jest.fn();

      await service.resetRequestedSongs();

      expect(repository.setRequestedSongs).toBeCalledWith([]);
    });
  });

  describe('isCooltime', () => {
    it('최근 4개의 신청곡 중 자신의 신청곡이 있을 시 쿨타임이 적용된다.', async () => {
      repository.getCooltimeSongs = jest.fn(async () => []);
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
        new Song('test song 4', 'viewer4', '시청자4', RequestType.ticket),
      ]);

      const result = await service.isCooltime('viewer1');

      expect(result).toBe(true);
    });

    it('신청곡이 4개 미만일 경우 쿨타임 목록도 적용한다.', async () => {
      repository.getCooltimeSongs = jest.fn(async () => [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
      ]);
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('test song 4', 'viewer4', '시청자4', RequestType.ticket),
      ]);

      const result = await service.isCooltime('viewer1');

      expect(result).toBe(true);
    });

    it('최근 4개의 신청곡에 자신의 신청곡이 없을 시 쿨타임이 미적용된다.', async () => {
      repository.getCooltimeSongs = jest.fn(async () => [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
      ]);
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('test song 4', 'viewer4', '시청자4', RequestType.ticket),
        new Song('test song 5', 'viewer5', '시청자5', RequestType.ticket),
      ]);

      const result = await service.isCooltime('viewer1');

      expect(result).toBe(false);
    });
  });

  describe('enqueueSong', () => {
    it('신청곡을 추가할 수 있어야 한다', async () => {
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
      ]);
      repository.setRequestedSongs = jest.fn();

      const song = new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket);
      const result = await service.enqueueSong(song);

      expect(result).toMatchObject(song);
      expect(repository.setRequestedSongs).toBeCalledWith([
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
      ]);
    });
  });

  describe('deleteSong', () => {
    it('특정 신청곡을 삭제할 수 있어야 한다.', async () => {
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
      ]);
      repository.setRequestedSongs = jest.fn();

      const result = await service.deleteSong(1);

      expect(result).toMatchObject(new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket));
      expect(repository.setRequestedSongs).toBeCalledWith([
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
      ]);
    });

    it('삭제하려는 신청곡이 없을 경우 오류를 반환해야 한다.', async () => {
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
      ]);
      repository.setRequestedSongs = jest.fn();

      const result = await service.deleteSong(3);

      expect(result).toMatchObject(new BusinessError('out-of-range'));
      expect(repository.setRequestedSongs).toBeCalledTimes(0);
    });
  });

  describe('reindexSong', () => {
    it('신청곡의 순서를 변경할 수 있어야 한다.', async () => {
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
        new Song('test song 4', 'viewer4', '시청자4', RequestType.ticket),
      ]);
      repository.setRequestedSongs = jest.fn();

      const result = await service.reindexSong([3, 0, 2, 1]);
      const expected = [
        new Song('test song 4', 'viewer4', '시청자4', RequestType.ticket),
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
      ];

      expect(result).toMatchObject(expected);
      expect(repository.setRequestedSongs).toBeCalledWith(expected);
    });

    it('입력된 index의 갯수와 신청곡의 갯수가 맞지 않을 시 오류를 반환해야 한다.', async () => {
      repository.getRequestedSongs = jest.fn(async () => [
        new Song('test song 1', 'viewer1', '시청자1', RequestType.ticket),
        new Song('test song 2', 'viewer2', '시청자2', RequestType.ticket),
        new Song('test song 3', 'viewer3', '시청자3', RequestType.ticket),
        new Song('test song 4', 'viewer4', '시청자4', RequestType.ticket),
      ]);
      repository.setRequestedSongs = jest.fn();

      const result = await service.reindexSong([3, 0, 2, 1, 4]);

      expect(result).toMatchObject(new BusinessError('out-of-range'));
      expect(repository.setRequestedSongs).toBeCalledTimes(0);
    });
  });
});
