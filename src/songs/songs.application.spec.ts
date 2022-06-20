import { Test } from '@nestjs/testing';
import { BusinessError, isBusinessError } from 'src/util/business-error';
import { Viewer } from 'src/viewers/viewers.entity';

import { ViewersService } from 'src/viewers/viewers.service';

import { SongsApplication } from './songs.application';
import Song, { RequestType } from './songs.entity';
import { SongsService } from './songs.service';

describe('SongsApplication', () => {
  let app: SongsApplication;
  let service: SongsService;
  let viewersService: ViewersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SongsApplication, { provide: SongsService, useValue: {} }, { provide: ViewersService, useValue: {} }],
    }).compile();

    app = module.get(SongsApplication);
    service = module.get(SongsService);
    viewersService = module.get(ViewersService);
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(service).toBeDefined();
    expect(viewersService).toBeDefined();
  });

  describe('getSongs', () => {
    it('신청곡 목록을 반환해야 한다', async () => {
      const expected = [
        new Song('test song 1', 'testviewer1', '테스트시청자1', RequestType.manual),
        new Song('test song 2', 'testviewer2', '테스트시청자2', RequestType.manual),
        new Song('test song 3', 'testviewer3', '테스트시청자3', RequestType.manual),
      ];
      service.getSongs = jest.fn().mockResolvedValue(expected);

      const result = await app.getSongs();

      expect(result).toMatchObject(expected);
    });
  });

  describe('requestSong', () => {
    it('신청곡이 신청되어야 한다.', async () => {
      const viewer = new Viewer({ index: 1, username: '테스트유저', ticket: 10, ticketPiece: 7 });
      const song = new Song('test song', 'testviewer', '테스트유저', RequestType.ticket);

      service.isCooltime = jest.fn().mockResolvedValue(false);
      service.enqueueSong = jest.fn().mockResolvedValue(song);
      viewersService.getViewer = jest.fn().mockResolvedValue(viewer);
      viewersService.payForSongRequest = jest.fn().mockResolvedValue(RequestType.ticket);

      const result = await app.requestSong('test song', 'testviewer', '테스트유저');

      expect(result).toBeInstanceOf(Song);
      expect(result).toMatchObject(song);

      expect(service.enqueueSong).toBeCalledWith(song);
      expect(viewersService.payForSongRequest).toBeCalledWith(viewer);
    });

    it('시청자 정보를 찾을 수 없는 경우 에러가 발생해야 한다.', async () => {
      service.isCooltime = jest.fn().mockResolvedValue(false);
      service.enqueueSong = jest.fn();
      viewersService.getViewer = jest.fn().mockResolvedValue(null);
      viewersService.payForSongRequest = jest.fn();

      const result = await app.requestSong('test song', 'testviewer', '테스트유저');

      expect(isBusinessError(result)).toBe(true);
      expect(result).toMatchObject(new BusinessError('viewer-not-exists'));

      expect(service.enqueueSong).not.toBeCalled();
      expect(viewersService.payForSongRequest).not.toBeCalled();
    });

    it('쿨타임인 경우 에러가 발생해야 한다.', async () => {
      const viewer = new Viewer({ index: 1, username: '테스트유저', ticket: 10, ticketPiece: 7 });

      service.isCooltime = jest.fn().mockResolvedValue(true);
      service.enqueueSong = jest.fn();
      viewersService.getViewer = jest.fn().mockResolvedValue(viewer);
      viewersService.payForSongRequest = jest.fn();

      const result = await app.requestSong('test song', 'testviewer', '테스트유저');

      expect(isBusinessError(result)).toBe(true);
      expect(result).toMatchObject(new BusinessError('in-cooltime'));

      expect(service.enqueueSong).not.toBeCalled();
      expect(viewersService.payForSongRequest).not.toBeCalled();
    });

    it('포인트가 부족할 경우 에러가 발생해야 한다.', async () => {
      const viewer = new Viewer({ index: 1, username: '테스트유저', ticket: 10, ticketPiece: 7 });

      service.isCooltime = jest.fn().mockResolvedValue(false);
      service.enqueueSong = jest.fn();
      viewersService.getViewer = jest.fn().mockResolvedValue(viewer);
      viewersService.payForSongRequest = jest.fn().mockResolvedValue(new BusinessError('no-points'));

      const result = await app.requestSong('test song', 'testviewer', '테스트유저');

      expect(isBusinessError(result)).toBe(true);
      expect(result).toMatchObject(new BusinessError('no-points'));

      expect(viewersService.payForSongRequest).toBeCalledWith(viewer);

      expect(service.enqueueSong).not.toBeCalled();
    });
  });

  describe('createSongManually', () => {
    it('주어진 title로 곡을 생성할 수 있어야 한다.', async () => {
      const song = new Song('test song', 'producerzenn', '프로듀서_젠', RequestType.manual);
      service.enqueueSong = jest.fn().mockResolvedValue(song);

      const result = await app.createSongManually('test song');

      expect(result).toMatchObject(song);
      expect(service.enqueueSong).toBeCalledWith({
        title: song.title,
        requestor: song.requestor,
        requestorName: song.requestorName,
        requestType: song.requestType,
      });
    });
  });

  describe('deleteSong', () => {
    it('해당하는 index의 곡을 삭제할 수 있어야 한다.', async () => {
      const song = new Song('deleted song', 'testviewer', '테스트유저', RequestType.ticket);
      service.deleteSong = jest.fn().mockResolvedValue(song);

      const result = await app.deleteSong(2, false);

      expect(result).toMatchObject(song);
      expect(service.deleteSong).toBeCalledWith(2);
    });

    it('해당하는 index의 곡을 환불할 수 있어야 한다.', async () => {
      const song = new Song('deleted song', 'testviewer', '테스트유저', RequestType.ticket);
      service.deleteSong = jest.fn().mockResolvedValue(song);
      viewersService.refundPoints = jest.fn();

      const result = await app.deleteSong(2, true);

      expect(result).toMatchObject(song);
      expect(service.deleteSong).toBeCalledWith(2);
      expect(viewersService.refundPoints).toBeCalledWith('testviewer', RequestType.ticket);
    });

    it('음수가 제공될 경우 에러가 발생해야 한다', async () => {
      service.deleteSong = jest.fn();

      const result = await app.deleteSong(-1, false);

      expect(result).toMatchObject(new BusinessError('out-of-range'));
    });

    it('삭제하려는 신청곡이 존재하지 않을 경우 에러가 발생해야 한다', async () => {
      service.deleteSong = jest.fn().mockResolvedValue(new BusinessError('out-of-range'));

      const result = await app.deleteSong(2, false);

      expect(result).toMatchObject(new BusinessError('out-of-range'));
    });

    it('환불 시 신청자가 존재하지 않을 경우 에러가 발생해야 한다', async () => {
      const song = new Song('deleted song', 'testviewer', '테스트유저', RequestType.ticket);
      service.deleteSong = jest.fn().mockResolvedValue(song);
      viewersService.refundPoints = jest.fn().mockResolvedValue(new BusinessError('viewer-not-exists'));

      const result = await app.deleteSong(2, true);

      expect(result).toMatchObject(new BusinessError('viewer-not-exists'));
    });
  });
});
