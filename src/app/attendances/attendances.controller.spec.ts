import { Test } from '@nestjs/testing';
import { AttendancesApplication } from './attendances.application';
import { AttendancesController } from './attendances.controller';
import { AttendDto } from './dtos/attend.dto';

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
      application.attend = jest.fn();

      const dto = new AttendDto();
      dto.twitchId = 'testviewer1';
      dto.username = '테스트시청자1';
      dto.attendedAt = new Date(2022, 11, 24, 20);
      dto.tier = 2;
      await controller.onSubscriberChat(dto);

      expect(application.attend).toBeCalledWith(dto);
    });
  });
});
