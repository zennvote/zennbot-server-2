import { Test } from '@nestjs/testing';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import { Viewer } from 'src/app/accounts/viewers.entity';
import { ViewersService } from 'src/app/accounts/viewers.service';
import { FlagSetting } from 'src/app/settings/entities/setting.entity';
import { SettingsService } from 'src/app/settings/settings.service';

import { SongsApplication } from './songs.application';
import Song, { RequestType } from './songs.entity';
import { SongsService } from './songs.service';

describe('SongsApplication', () => {
  let app: SongsApplication;
  let service: SongsService;
  let viewersService: ViewersService;
  let settingsService: SettingsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SongsApplication,
        { provide: SongsService, useValue: {} },
        { provide: ViewersService, useValue: {} },
        { provide: SettingsService, useValue: {} },
      ],
    }).compile();

    app = module.get(SongsApplication);
    service = module.get(SongsService);
    viewersService = module.get(ViewersService);
    settingsService = module.get(SettingsService);
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(service).toBeDefined();
    expect(viewersService).toBeDefined();
    expect(settingsService).toBeDefined();
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
    const song = new Song('test song', 'testviewer', '테스트유저', RequestType.ticket);
    const viewer = new Viewer({
      index: 1, username: '테스트유저', ticket: 10, ticketPiece: 7,
    });

    beforeEach(() => {
      const viewer = new Viewer({
        index: 1, username: '테스트유저', ticket: 10, ticketPiece: 7,
      });
      const song = new Song('test song', 'testviewer', '테스트유저', RequestType.ticket);

      service.isCooltime = jest.fn().mockResolvedValue(false);
      service.enqueueSong = jest.fn().mockResolvedValue(song);
      viewersService.getViewer = jest.fn().mockResolvedValue(viewer);
      viewersService.payForSongRequest = jest.fn().mockResolvedValue(RequestType.ticket);
      settingsService.getSetting = jest.fn(async (key: string) => {
        if (key === 'request-enabled') {
          return new FlagSetting({ key: 'request-enabled', value: true });
        } if (key === 'goldenbell-enabled') {
          return new FlagSetting({ key: 'goldenbell-enabled', value: false });
        }
        return null;
      });
    });

    it('신청곡이 신청되어야 한다.', async () => {
      const result = await app.requestSong('test song', 'testviewer', '테스트유저');

      expect(result).toBeInstanceOf(Song);
      expect(result).toMatchObject(song);

      expect(service.enqueueSong).toBeCalledWith(song);
      expect(viewersService.payForSongRequest).toBeCalledWith(viewer);
    });

    it('신청곡이 비활성화되어있는 경우 에러가 발생해야 한다.', async () => {
      settingsService.getSetting = jest.fn(async (key: string) => {
        if (key === 'request-enabled') {
          return new FlagSetting({ key: 'request-enabled', value: false });
        } if (key === 'goldenbell-enabled') {
          return new FlagSetting({ key: 'goldenbell-enabled', value: false });
        }
        return null;
      });

      const result = await app.requestSong('test song', 'testviewer', '테스트유저');

      expect(isBusinessError(result)).toBe(true);
      expect(result).toMatchObject(new BusinessError('request-disabled'));

      expect(service.enqueueSong).not.toBeCalled();
      expect(viewersService.payForSongRequest).not.toBeCalled();
    });

    it('골든벨이 활성화되어있는 경우 무료로 신청되어야 한다.', async () => {
      const song = new Song('test song', 'testviewer', '테스트유저', RequestType.freemode);

      service.enqueueSong = jest.fn().mockResolvedValue(song);
      settingsService.getSetting = jest.fn(async (key: string) => {
        if (key === 'request-enabled') {
          return new FlagSetting({ key: 'request-enabled', value: true });
        } if (key === 'goldenbell-enabled') {
          return new FlagSetting({ key: 'goldenbell-enabled', value: true });
        }
        return null;
      });

      const result = await app.requestSong('test song', 'testviewer', '테스트유저');

      expect(result).toBeInstanceOf(Song);
      expect(result).toMatchObject(song);

      expect(service.enqueueSong).toBeCalledWith(song);
      expect(viewersService.payForSongRequest).not.toBeCalled();
    });

    it('시청자 정보를 찾을 수 없는 경우 에러가 발생해야 한다.', async () => {
      viewersService.getViewer = jest.fn().mockResolvedValue(null);

      const result = await app.requestSong('test song', 'testviewer', '테스트유저');

      expect(isBusinessError(result)).toBe(true);
      expect(result).toMatchObject(new BusinessError('viewer-not-exists'));

      expect(service.enqueueSong).not.toBeCalled();
      expect(viewersService.payForSongRequest).not.toBeCalled();
    });

    it('쿨타임인 경우 에러가 발생해야 한다.', async () => {
      service.isCooltime = jest.fn().mockResolvedValue(true);

      const result = await app.requestSong('test song', 'testviewer', '테스트유저');

      expect(isBusinessError(result)).toBe(true);
      expect(result).toMatchObject(new BusinessError('in-cooltime'));

      expect(service.enqueueSong).not.toBeCalled();
      expect(viewersService.payForSongRequest).not.toBeCalled();
    });

    it('포인트가 부족할 경우 에러가 발생해야 한다.', async () => {
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
