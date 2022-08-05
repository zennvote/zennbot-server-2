import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as Sinon from 'sinon';

import { BusinessError } from 'src/util/business-error';
import * as originalTwitch from 'src/util/twitch';

import { viewerFactory } from 'src/app/viewers/entities/viewer.factory';
import { ViewersRepository } from 'src/app/viewers/viewers.repository';

import { attendanceFactory } from './entities/attendance.factory';
import { AttendancesRepository } from './repositories/attendances.repository';
import { AttendancesApplication } from './attendances.application';
import { AttendancesService } from './attendances.service';
import { Viewer } from '../viewers/viewers.entity';

describe('AttendancesApplication', () => {
  let application: AttendancesApplication;
  let service: AttendancesService;
  let repository: AttendancesRepository;
  let viewersRepository: ViewersRepository;
  let configService: ConfigService;
  let twitch: Sinon.SinonStubbedInstance<typeof originalTwitch>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AttendancesApplication,
        { provide: AttendancesService, useValue: {} },
        { provide: AttendancesRepository, useValue: {} },
        { provide: ViewersRepository, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    application = module.get(AttendancesApplication);
    service = module.get(AttendancesService);
    repository = module.get(AttendancesRepository);
    viewersRepository = module.get(ViewersRepository);
    configService = module.get(ConfigService);
    twitch = Sinon.stub(originalTwitch);

    configService.get = jest.fn((key) => key);
  });

  afterEach(() => Sinon.restore());

  it('should be defined', () => {
    expect(application).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(viewersRepository).toBeDefined();
    expect(twitch).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('attend', () => {
    let viewer: Viewer;

    beforeEach(() => {
      viewer = viewerFactory.indexed(1).build();
      repository.getRecentAttendance = jest.fn().mockReturnValue(null);
      repository.saveAttendance = jest.fn();
      viewersRepository.findByTwitchIdAndUsername = jest.fn().mockResolvedValue(viewer);
      viewersRepository.save = jest.fn();
      twitch.getSubscription.resolves(2);
    });

    it('출석을 등록하고 포인트를 지급해야 한다', async () => {
      const { ticketPiece } = viewer;
      const result = await application.attend({
        twitchId: 'testviewer1',
        username: '테스트시청자1',
        attendedAt: new Date(2022, 11, 24, 22),
      });

      const expected = attendanceFactory.build({
        attendedAt: new Date(2022, 11, 24, 22),
        broadcastedAt: '2022-11-24',
        twitchId: 'testviewer1',
        tier: 2,
      });
      const expectedViewer = viewerFactory.indexed(1).build({
        ticketPiece: ticketPiece + 6,
      });

      expect(result).not.toBeInstanceOf(BusinessError);
      expect(repository.saveAttendance).toBeCalledWith(expected);
      expect(viewersRepository.save).toBeCalledWith(expectedViewer);
      expect(twitch.getSubscription.calledWith('TMI_CHANNEL', 'TMI_CHANNEL_ID', 'testviewer1'));
    });

    it('기준시 이전에 출석하는 경우 방송일은 전날로 설정되어야 한다', async () => {
      const result = await application.attend({
        twitchId: 'testviewer1',
        username: '테스트시청자1',
        attendedAt: new Date(2022, 11, 25, 9),
      });

      const expected = attendanceFactory.build({
        attendedAt: new Date(2022, 11, 25, 9),
        broadcastedAt: '2022-11-24',
        twitchId: 'testviewer1',
        tier: 2,
      });

      expect(result).not.toBeInstanceOf(BusinessError);
      expect(viewersRepository.save).toBeCalledWith(viewer);
      expect(repository.saveAttendance).toBeCalledWith(expected);
    });

    it.todo('최근 출석의 방송일이 현재 방송일과 다르다면 출석을 처리해야 한다');

    it.todo('최근 출석의 방송일이 현재 방송일과 같다면 출석을 처리하지 않아야 한다');

    it.todo('티어 정보 조회에 실패했을 경우 0티어 출석으로 처리해야 한다');

    it.todo('시청자 정보 조회에 실패했을 경우 출석을 처리하지 않아야 한다');
  });

  describe('getAttendances', () => {
    it.todo('출석 정보를 조회할 수 있어야 한다');
  });

  describe('getAttendanceOfBroadcast', () => {
    it.todo('특정 방송일에 대한 출석 정보를 조회할 수 있어야 한다');
  });
});
