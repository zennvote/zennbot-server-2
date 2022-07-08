import { Test } from '@nestjs/testing';
import { BusinessError } from 'src/util/business-error';
import { AttendancesApplication } from './attendances.application';
import { AttendancesController } from './attendances.controller';
import { AttendDto } from './dtos/attend.dto';
import { Attendance } from './entities/attendance.entity';

describe('AttendancesController', () => {
  let controller: AttendancesController;
  let application: AttendancesApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AttendancesController],
      providers: [{ provide: AttendancesApplication, useValue: {} }],
    }).compile();

    controller = module.get(AttendancesController);
    application = module.get(AttendancesApplication);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(application).toBeDefined();
  });

  describe('onSubscriberChat', () => {
    it('구독자가 채팅을 칠 시 출석을 생성해야한다.', async () => {
      const sendMock = jest.fn();
      application.attend = jest.fn();

      const dto = {
        twitchId: 'testviewer1',
        username: '테스트시청자1',
        attendedAt: new Date(2022, 11, 24, 20),
        tier: 2,
      };

      await controller.onSubscriberChat({
        twitchId: 'testviewer1',
        username: '테스트시청자1',
        attendedAt: new Date(2022, 11, 24, 20),
        tier: 2,
        send: sendMock,
      });

      expect(application.attend).toBeCalledWith(dto);
      expect(sendMock).toBeCalledWith('@testviewer1 님에게 2티어 출석 보상이 지급되었습니다!');
    });

    it('출석이 안되었을 경우 메시지를 출력하지 않는다.', async () => {
      const sendMock = jest.fn();
      application.attend = jest.fn().mockResolvedValue(new BusinessError('viewer-not-found'));

      const dto = {
        twitchId: 'testviewer1',
        username: '테스트시청자1',
        attendedAt: new Date(2022, 11, 24, 20),
        tier: 2,
      };

      await controller.onSubscriberChat({
        twitchId: 'testviewer1',
        username: '테스트시청자1',
        attendedAt: new Date(2022, 11, 24, 20),
        tier: 2,
        send: sendMock,
      });

      expect(application.attend).toBeCalledWith(dto);
      expect(sendMock).not.toBeCalled();
    });
  });

  describe('getAttendances', () => {
    it('출석을 조회할 수 있어야 한다', async () => {
      const attendances = [new Attendance(), new Attendance(), new Attendance()];
      attendances[0].attendedAt = new Date(2022, 11, 24);
      attendances[0].attendedAt = new Date(2022, 11, 25);
      attendances[0].attendedAt = new Date(2022, 11, 26);
      application.getAttendances = jest.fn().mockResolvedValueOnce(attendances);

      const result = await controller.getAttendances();

      expect(result).toBe(attendances);
    });
  });
});
