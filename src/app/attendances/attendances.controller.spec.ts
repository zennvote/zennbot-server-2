import { Test } from '@nestjs/testing';
import { BusinessError } from 'src/util/business-error';
import { AttendancesApplication } from './attendances.application';
import { AttendancesController } from './attendances.controller';
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
    it.todo('구독자가 채팅을 칠 시 출석을 생성해야한다.');

    it.todo('구독 티어 조회 문제로 0티어 보상이 지급되는 경우 별도 안내가 출력되어야 한다');

    it.todo('출석이 안되었을 경우 메시지를 출력하지 않는다.');
  });

  describe('getAttendances', () => {
    it.todo('출석을 조회할 수 있어야 한다');
  });

  describe('getAttendances', () => {
    it.todo('출석을 조회할 수 있어야 한다');
  });
});
