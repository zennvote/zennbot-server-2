import { Test, TestingModule } from '@nestjs/testing';
import { ViewersController } from './viewers.controller';
import { Viewer } from './viewers.entity';
import { ViewersService } from './viewers.service';

describe('ViewersController', () => {
  let controller: ViewersController;
  let service: ViewersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewersController],
      providers: [{ provide: ViewersService, useValue: {} }],
    }).compile();

    controller = module.get<ViewersController>(ViewersController);
    service = module.get<ViewersService>(ViewersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /viewers', () => {
    it('사용자 목록을 반환해야 한다', async () => {
      service.getViewers = jest.fn(async (): Promise<Viewer[]> => [
        new Viewer({
          index: 1,
          ticket: 10,
          ticketPiece: 12,
          username: '테스트유저1',
        }),
        new Viewer({
          index: 2,
          ticket: 0,
          ticketPiece: 20,
          username: '테스트유저2',
          prefix: 'test-prefix',
        }),
      ]);

      const result = await controller.getViewers();

      expect(result).toMatchObject([
        {
          index: 1,
          ticket: 10,
          ticketPiece: 12,
          username: '테스트유저1',
        },
        {
          index: 2,
          ticket: 0,
          ticketPiece: 20,
          username: '테스트유저2',
          prefix: 'test-prefix',
        },
      ]);
    });
  });

  describe('COMMAND 조각', () => {
    it('사용자의 정보를 반환해야 한다.', async () => {
      service.getViewer = jest.fn(
        async (): Promise<Viewer> => new Viewer({
          index: 1,
          ticket: 10,
          ticketPiece: 12,
          username: '테스트유저1',
          prefix: 'test-prefix',
        }),
      );
      const sendFn = jest.fn();

      await controller.whoAmICommand({
        message: '!조각',
        args: [],
        channel: 'channel',
        tags: {
          username: 'testuser1',
          'display-name': '테스트유저1',
        },
        send: sendFn,
      });

      expect(service.getViewer).toBeCalledWith('testuser1', '테스트유저1');
      expect(sendFn).toBeCalledWith('[test-prefix] 테스트유저1 티켓 10장 | 조각 12장 보유중');
    });

    it('사용자 정보가 없을 시 경고 메시지를 반환해야 한다', async () => {
      service.getViewer = jest.fn(async () => null);
      const sendFn = jest.fn();

      await controller.whoAmICommand({
        message: '!조각',
        args: [],
        channel: 'channel',
        tags: {
          username: 'testuser1',
          'display-name': '테스트유저1',
        },
        send: sendFn,
      });

      expect(service.getViewer).toBeCalledWith('testuser1', '테스트유저1');
      expect(sendFn).toBeCalledWith('테스트유저1님의 데이터가 존재하지 않습니다!');
    });
  });

  describe('COMMAND 지급', () => {
    it('헤당 유저에게 티켓을 지급해야 한다', async () => {
      service.setPointsWithUsername = jest.fn(async () => true);
      service.getViewerByUsername = jest.fn(
        async () => new Viewer({
          index: 1,
          ticket: 10,
          ticketPiece: 12,
          username: '테스트유저1',
          twitchId: 'testuser1',
        }),
      );
      const sendFn = jest.fn();

      await controller.givePointCommand({
        message: '!지급 곡 테스트유저1 10',
        args: ['곡', '테스트유저1', '10'],
        channel: 'channel',
        tags: {
          username: 'manageruser',
          'display-name': '매니저유저1',
        },
        send: sendFn,
      });

      expect(service.getViewerByUsername).toBeCalledWith('테스트유저1');
      expect(service.setPointsWithUsername).toBeCalledWith('테스트유저1', { ticket: 20 });
      expect(sendFn).toBeCalledWith('테스트유저1님에게 곡 10개를 지급하였습니다.');
    });

    it('헤당 유저에게 조각을 지급해야 한다', async () => {
      service.setPointsWithUsername = jest.fn(async () => true);
      service.getViewerByUsername = jest.fn(
        async () => new Viewer({
          index: 1,
          ticket: 10,
          ticketPiece: 12,
          username: '테스트유저1',
          twitchId: 'testuser1',
        }),
      );
      const sendFn = jest.fn();

      await controller.givePointCommand({
        message: '!지급 조각 테스트유저1 4',
        args: ['조각', '테스트유저1', '4'],
        channel: 'channel',
        tags: {
          username: 'manageruser',
          'display-name': '매니저유저1',
        },
        send: sendFn,
      });

      expect(service.getViewerByUsername).toBeCalledWith('테스트유저1');
      expect(service.setPointsWithUsername).toBeCalledWith('테스트유저1', { ticketPiece: 16 });
      expect(sendFn).toBeCalledWith('테스트유저1님에게 조각 4개를 지급하였습니다.');
    });

    it('갯수를 생략할 시 1개를 지급해야 한다.', async () => {
      service.setPointsWithUsername = jest.fn(async () => true);
      service.getViewerByUsername = jest.fn(
        async () => new Viewer({
          index: 1,
          ticket: 10,
          ticketPiece: 12,
          username: '테스트유저1',
          twitchId: 'testuser1',
        }),
      );
      const sendFn = jest.fn();

      await controller.givePointCommand({
        message: '!지급 조각 테스트유저1',
        args: ['조각', '테스트유저1'],
        channel: 'channel',
        tags: {
          username: 'manageruser',
          'display-name': '매니저유저1',
        },
        send: sendFn,
      });

      expect(service.getViewerByUsername).toBeCalledWith('테스트유저1');
      expect(service.setPointsWithUsername).toBeCalledWith('테스트유저1', { ticketPiece: 13 });
      expect(sendFn).toBeCalledWith('테스트유저1님에게 조각 1개를 지급하였습니다.');
    });

    it('음수를 입력할 시 포인트를 차감해야 한다.', async () => {
      service.setPointsWithUsername = jest.fn(async () => true);
      service.getViewerByUsername = jest.fn(
        async () => new Viewer({
          index: 1,
          ticket: 10,
          ticketPiece: 12,
          username: '테스트유저1',
          twitchId: 'testuser1',
        }),
      );
      const sendFn = jest.fn();

      await controller.givePointCommand({
        message: '!지급 조각 테스트유저1 -8',
        args: ['조각', '테스트유저1', '-8'],
        channel: 'channel',
        tags: {
          username: 'manageruser',
          'display-name': '매니저유저1',
        },
        send: sendFn,
      });

      expect(service.getViewerByUsername).toBeCalledWith('테스트유저1');
      expect(service.setPointsWithUsername).toBeCalledWith('테스트유저1', { ticketPiece: 4 });
      expect(sendFn).toBeCalledWith('테스트유저1님의 조각 8개를 차감하였습니다.');
    });

    it('잘못된 형식으로 입력 시 경고 메시지를 반환해야 한다', async () => {
      const sendFn = jest.fn();

      await controller.givePointCommand({
        message: '!지급 테스트유저1 조각 4',
        args: ['테스트유저1', '조각', '4'],
        channel: 'channel',
        tags: {
          username: 'manageruser',
          'display-name': '매니저유저1',
        },
        send: sendFn,
      });

      expect(sendFn).toBeCalledWith('잘못된 명령어 형식입니다. 다시 한번 확인해주세요!');
    });

    it('사용자 정보가 없을 시 경고 메시지를 반환해야 한다', async () => {
      service.getViewerByUsername = jest.fn(async () => null);
      const sendFn = jest.fn();

      await controller.givePointCommand({
        message: '!지급 조각 테스트유저1 4',
        args: ['조각', '테스트유저1', '4'],
        channel: 'channel',
        tags: {
          username: 'manageruser',
          'display-name': '매니저유저1',
        },
        send: sendFn,
      });

      expect(service.getViewerByUsername).toBeCalledWith('테스트유저1');
      expect(sendFn).toBeCalledWith('존재하지 않는 시청자입니다.');
    });
  });
});
