import { Test, TestingModule } from '@nestjs/testing';
import { ManagersService } from 'src/managers/managers.service';
import { ViewersController } from './viewers.controller';
import { Viewer } from './viewers.entity';
import { ViewersService } from './viewers.service';

describe('ViewersController', () => {
  let controller: ViewersController;
  let service: ViewersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewersController],
      providers: [
        {
          provide: ViewersService,
          useValue: {},
        },
        {
          provide: ManagersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ViewersController>(ViewersController);
    service = module.get<ViewersService>(ViewersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /viewers', () => {
    it('사용자 목록을 반환해야 한다', async () => {
      service.getViewers = jest.fn(async (): Promise<Viewer[]> => {
        return [
          {
            index: 1,
            ticket: 10,
            ticketPiece: 12,
            username: 'test-user-1',
          },
          {
            index: 2,
            ticket: 0,
            ticketPiece: 20,
            username: 'test-user-2',
            prefix: 'test-prefix',
          },
        ];
      });

      const result = await controller.getViewers();

      expect(result).toMatchObject([
        {
          index: 1,
          ticket: 10,
          ticketPiece: 12,
          username: 'test-user-1',
        },
        {
          index: 2,
          ticket: 0,
          ticketPiece: 20,
          username: 'test-user-2',
          prefix: 'test-prefix',
        },
      ]);
    });
  });

  describe('COMMAND 조각', () => {
    it('사용자의 정보를 반환해야 한다.', async () => {
      service.getViewer = jest.fn(
        async (): Promise<Viewer> =>
          new Viewer({
            index: 1,
            ticket: 10,
            ticketPiece: 12,
            username: 'test-user-1',
            prefix: 'test-prefix',
          }),
      );
      const sendFn = jest.fn();

      await controller.whoAmICommand({
        message: '!조각',
        args: [],
        channel: 'channel',
        tags: {
          username: 'test-user-1',
          'display-name': 'testuser',
        },
        send: sendFn,
      });

      expect(service.getViewer).toBeCalledWith('test-user-1', 'testuser');
      expect(sendFn).toBeCalledWith('[test-prefix] testuser 티켓 10장 | 조각 12장 보유중');
    });

    it('사용자 정보가 없을 시 경고 메시지를 반환해야 한다', async () => {
      service.getViewer = jest.fn(async () => undefined);
      const sendFn = jest.fn();

      await controller.whoAmICommand({
        message: '!조각',
        args: [],
        channel: 'channel',
        tags: {
          username: 'test-user-1',
          'display-name': 'testuser',
        },
        send: sendFn,
      });

      expect(service.getViewer).toBeCalledWith('test-user-1', 'testuser');
      expect(sendFn).toBeCalledWith('testuser님의 데이터가 존재하지 않습니다!');
    });
  });
});
