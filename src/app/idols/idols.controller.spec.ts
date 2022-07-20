import { Test, TestingModule } from '@nestjs/testing';
import { CommandPayload } from 'src/libs/tmi/tmi.types';
import { BusinessError } from 'src/util/business-error';
import { IdolsApplication } from './idols.application';
import { IdolsController } from './idols.controller';
import { Idol } from './idols.entity';

describe('IdolsController', () => {
  let controller: IdolsController;
  let application: IdolsApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdolsController],
      providers: [{ provide: IdolsApplication, useValue: {} }],
    }).compile();

    controller = module.get<IdolsController>(IdolsController);
    application = module.get(IdolsApplication);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(application).toBeDefined();
  });

  describe('COMMAND !아이돌', () => {
    it('아이돌 검색 결과를 반환해야 한다.', async () => {
      const sendMock = jest.fn();
      const payload: CommandPayload = {
        args: ['히구치', '마도카'],
        channel: 'testchannel',
        message: '!아이돌 히구치 마도카',
        tags: {},
        send: sendMock,
      };
      application.searchIdol = jest.fn().mockResolvedValue(
        new Idol({
          firstName: '히구치',
          lastName: '마도카',
          company: '283',
          unit: 'noctchill',
          type: '쿨',
          birthday: '10월 27일',
          age: '17',
          height: '159',
          weight: '47',
          threeSize: '79-55-79',
          hometown: '도쿄',
          cv: '츠지야 리오',
          introduction: '본심을 알다가도 모를 아티스트 아이돌',
        }),
      );

      await controller.searchIdol(payload);

      expect(sendMock).toBeCalledWith(
        '히구치 마도카 / 283 프로덕션, noctchill 소속, 쿨타입 / 10월 27일생 / 17세 / 159cm, 47kg, 79-55-79 / 도쿄 출신 / CV. 츠지야 리오 / 본심을 알다가도 모를 아티스트 아이돌',
      );
    });

    it('nullable한 정보를 정상적으로 표기해야 한다', async () => {
      const sendMock = jest.fn();
      const payload: CommandPayload = {
        args: ['히구치', '마도카'],
        channel: 'testchannel',
        message: '!아이돌 히구치 마도카',
        tags: {},
        send: sendMock,
      };
      application.searchIdol = jest.fn().mockResolvedValue(
        new Idol({
          lastName: '마도카',
          company: '283',
          birthday: '10월 27일',
          age: '17',
          height: '159',
          weight: '47',
          hometown: '도쿄',
          introduction: '본심을 알다가도 모를 아티스트 아이돌',
        }),
      );

      await controller.searchIdol(payload);

      expect(sendMock).toBeCalledWith(
        '마도카 / 283 프로덕션 / 10월 27일생 / 17세 / 159cm, 47kg / 도쿄 출신 / 본심을 알다가도 모를 아티스트 아이돌',
      );
    });

    it('비정규 정보를 정상적으로 표기해야 한다', async () => {
      const sendMock = jest.fn();
      const payload: CommandPayload = {
        args: ['히구치', '마도카'],
        channel: 'testchannel',
        message: '!아이돌 히구치 마도카',
        tags: {},
        send: sendMock,
      };
      application.searchIdol = jest.fn().mockResolvedValue(
        new Idol({
          lastName: '마도카',
          company: '불명',
          birthday: '불명',
          age: '불명',
          height: '불명',
          weight: '불명',
          hometown: '불명',
          introduction: '본심을 알다가도 모를 아티스트 아이돌',
        }),
      );

      await controller.searchIdol(payload);

      expect(sendMock).toBeCalledWith(
        '마도카 / 소속사 불명 / 생일 불명 / 나이 불명 / 신장 불명, 체중 불명 / 출신지 불명 / 본심을 알다가도 모를 아티스트 아이돌',
      );
    });

    it('해당하는 아이돌이 여러명일 시 에러 메시지가 표기돼야 한다', async () => {
      const sendMock = jest.fn();
      const payload: CommandPayload = {
        args: ['나오'],
        channel: 'testchannel',
        message: '!아이돌 나오',
        tags: {},
        send: sendMock,
      };
      application.searchIdol = jest.fn().mockResolvedValue(new BusinessError('multiple-result'));

      await controller.searchIdol(payload);

      expect(sendMock).toBeCalledWith('해당하는 아이돌이 두명 이상 존재합니다. 성과 이름을 둘 다 입력해주세요!');
    });

    it('해당하는 아이돌이 여러명일 시 에러 메시지가 표기돼야 한다', async () => {
      const sendMock = jest.fn();
      const payload: CommandPayload = {
        args: ['시프트'],
        channel: 'testchannel',
        message: '!아이돌 시프트',
        tags: {},
        send: sendMock,
      };
      application.searchIdol = jest.fn().mockResolvedValue(new BusinessError('no-result'));

      await controller.searchIdol(payload);

      expect(sendMock).toBeCalledWith('해당하는 아이돌이 없습니다!');
    });
  });

  it('오늘 생일인 아이돌 검색 결과를 반환해야 한다.', async () => {
    const sendMock = jest.fn();
    const payload: CommandPayload = {
      args: [],
      channel: 'testchannel',
      message: '!생일돌',
      tags: {},
      send: sendMock,
    };
    application.getBirthdayIdols = jest
      .fn()
      .mockResolvedValue([
        new Idol({ firstName: '히구치', lastName: '마도카' }),
        new Idol({ firstName: '사기사와', lastName: '후미카' }),
      ]);

    await controller.getBirthdayIdols(payload);

    expect(sendMock).toBeCalledWith('오늘 생일인 아이돌은 히구치 마도카, 사기사와 후미카입니다');
  });

  it('생일인 아이돌이 없을 시 에러 메시지가 표기돼야 한다', async () => {
    const sendMock = jest.fn();
    const payload: CommandPayload = {
      args: [],
      channel: 'testchannel',
      message: '!생일돌',
      tags: {},
      send: sendMock,
    };
    application.getBirthdayIdols = jest.fn().mockResolvedValue(new BusinessError('no-result'));

    await controller.getBirthdayIdols(payload);

    expect(sendMock).toBeCalledWith('오늘 생일인 아이돌이 없습니다!');
  });
});
