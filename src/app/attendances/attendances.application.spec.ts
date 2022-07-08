import { Test } from '@nestjs/testing';
import { BusinessError } from 'src/util/business-error';
import { Viewer } from '../viewers/viewers.entity';
import { ViewersRepository } from '../viewers/viewers.repository';
import { AttendancesApplication } from './attendances.application';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { AttendancesRepository } from './repositories/attendances.repository';

describe('AttendancesApplication', () => {
  let application: AttendancesApplication;
  let service: AttendancesService;
  let repository: AttendancesRepository;
  let viewersRepository: ViewersRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AttendancesApplication,
        { provide: AttendancesService, useValue: {} },
        { provide: AttendancesRepository, useValue: {} },
        { provide: ViewersRepository, useValue: {} },
      ],
    }).compile();

    application = module.get(AttendancesApplication);
    service = module.get(AttendancesService);
    repository = module.get(AttendancesRepository);
    viewersRepository = module.get(ViewersRepository);
  });

  it('should be defined', () => {
    expect(application).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(viewersRepository).toBeDefined();
  });

  describe('attend', () => {
    it('출석을 등록하고 포인트를 지급해야 한다', async () => {
      const recentAttendance = new Attendance();
      recentAttendance.attendedAt = new Date(2022, 11, 24);
      const viewer = new Viewer();

      repository.getRecentAttendance = jest.fn().mockReturnValue(recentAttendance);
      repository.saveAttendance = jest.fn();
      viewersRepository.findByTwitchIdAndUsername = jest.fn().mockResolvedValue(viewer);
      viewersRepository.save = jest.fn();
      service.isAttendable = jest.fn().mockReturnValue(true);
      viewer.getAttendanceReward = jest.fn();

      await application.attend({
        twitchId: 'testviewer1',
        username: '테스트시청자1',
        attendedAt: new Date(2022, 11, 25),
        tier: 2,
      });

      const expected = new Attendance();
      expected.twitchId = 'testviewer1';
      expected.attendedAt = new Date(2022, 11, 25);
      expected.tier = 2;

      expect(viewer.getAttendanceReward).toBeCalledWith(2);
      expect(viewersRepository.save).toBeCalledWith(viewer);
      expect(repository.saveAttendance).toBeCalledWith(expected);
    });

    it('출석이 불가능한 경우 에러를 발생시킨다', async () => {
      const recentAttendance = new Attendance();
      recentAttendance.attendedAt = new Date(2022, 11, 24);
      const viewer = new Viewer();

      repository.getRecentAttendance = jest.fn().mockReturnValue(recentAttendance);
      repository.saveAttendance = jest.fn();
      viewersRepository.findByTwitchIdAndUsername = jest.fn().mockResolvedValue(viewer);
      viewersRepository.save = jest.fn();
      service.isAttendable = jest.fn().mockReturnValue(false);
      viewer.getAttendanceReward = jest.fn();

      const result = await application.attend({
        twitchId: 'testviewer1',
        username: '테스트시청자1',
        attendedAt: new Date(2022, 11, 25),
        tier: 2,
      });

      expect(result).toBeInstanceOf(BusinessError);
      expect(result).toHaveProperty('error', 'already-attended');
      expect(viewersRepository.save).not.toBeCalled();
      expect(repository.saveAttendance).not.toBeCalled();
    });

    it('출석 포인트를 지급할 시청자 정보가 없을 경우 에러를 발생시킨다', async () => {
      const recentAttendance = new Attendance();
      recentAttendance.attendedAt = new Date(2022, 11, 24);

      repository.getRecentAttendance = jest.fn().mockReturnValue(recentAttendance);
      repository.saveAttendance = jest.fn();
      viewersRepository.findByTwitchIdAndUsername = jest.fn().mockResolvedValue(null);
      viewersRepository.save = jest.fn();
      service.isAttendable = jest.fn().mockReturnValue(true);

      const result = await application.attend({
        twitchId: 'testviewer1',
        username: '테스트시청자1',
        attendedAt: new Date(2022, 11, 25),
        tier: 2,
      });

      expect(result).toBeInstanceOf(BusinessError);
      expect(result).toHaveProperty('error', 'user-not-found');
      expect(viewersRepository.save).not.toBeCalled();
      expect(repository.saveAttendance).not.toBeCalled();
    });
  });

  describe('getAttendances', () => {
    it('출석 정보를 조회할 수 있어야 한다', async () => {
      const attendances = [new Attendance(), new Attendance(), new Attendance()];
      attendances[0].attendedAt = new Date(2022, 11, 24);
      attendances[0].attendedAt = new Date(2022, 11, 25);
      attendances[0].attendedAt = new Date(2022, 11, 26);

      repository.getAttendances = jest.fn().mockResolvedValue(attendances);

      const result = await application.getAttendances();

      expect(result).toBe(attendances);
    });
  });
});
