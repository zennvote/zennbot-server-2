import { Test, TestingModule } from '@nestjs/testing';
import { Viewer } from './viewers.entity';
import { ViewersRepository } from './viewers.repository';
import { ViewersService } from './viewers.service';

const getTestViewer = () => new Viewer({
  index: 1,
  ticket: 10,
  ticketPiece: 8,
  username: '테스트유저1',
  twitchId: 'testuser1',
  prefix: '테스트 칭호',
});

describe('ViewersService', () => {
  let service: ViewersService;
  let repository: ViewersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewersService,
        {
          provide: ViewersRepository,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ViewersService>(ViewersService);
    repository = module.get<ViewersRepository>(ViewersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getViewers', () => {
    it('사용자 목록을 반환해야 한다', async () => {
      const expected = getTestViewer();
      repository.find = jest.fn(async () => [expected]);

      const result = await service.getViewers();

      expect(result).toMatchObject([expected]);
    });
  });

  describe('getViewer', () => {
    it('twitchId로 사용자를 조회할 수 있어야 한다', async () => {
      const expected = getTestViewer();
      repository.findOne = jest.fn(async (viewer) => {
        const { twitchId } = viewer ?? {};
        if (twitchId) {
          return expected;
        }
        return null;
      });
      repository.update = jest.fn();

      const result = await service.getViewer('testuser1', '테스트유저1');

      expect(result).toMatchObject(expected);
      expect(repository.findOne).toBeCalledTimes(1);
      expect(repository.findOne).nthCalledWith(1, { twitchId: 'testuser1' });
    });

    it('twitchId로 사용자를 조회되지 않으면 username으로 조회할 수 있어야 한다', async () => {
      const expected = getTestViewer();
      repository.findOne = jest.fn(async (viewer) => {
        const { username } = viewer ?? {};
        if (username) {
          return expected;
        }
        return null;
      });
      repository.update = jest.fn();

      const result = await service.getViewer('testuser1', '테스트유저1');

      expect(result).toMatchObject(expected);
      expect(repository.findOne).toBeCalledTimes(2);
      expect(repository.findOne).nthCalledWith(1, { twitchId: 'testuser1' });
      expect(repository.findOne).nthCalledWith(2, { username: '테스트유저1' });
      expect(repository.update).toBeCalledWith(
        { index: 1 },
        { twitchId: 'testuser1' },
      );
    });

    it('username이 변경된 유저를 조회할 경우 갱신해야 한다', async () => {
      const expected = getTestViewer();
      repository.findOne = jest.fn(async (viewer) => {
        const { twitchId } = viewer ?? {};
        if (twitchId) {
          return expected;
        }
        return null;
      });
      repository.update = jest.fn();

      const result = await service.getViewer('testuser1', 'changedname');

      expect(result).toMatchObject(expected);
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).nthCalledWith(1, { twitchId: 'testuser1' });
      expect(repository.update).toBeCalledWith(
        { index: 1 },
        { username: 'changedname' },
      );
    });

    it('존재하지 않는 유저는 null을 반환해야 한다', async () => {
      repository.findOne = jest.fn(async () => null);
      repository.update = jest.fn();

      const result = await service.getViewer('testuser1', '테스트유저1');

      expect(result).toBeNull();
      expect(repository.findOne).toBeCalledTimes(2);
      expect(repository.findOne).nthCalledWith(1, { twitchId: 'testuser1' });
      expect(repository.findOne).nthCalledWith(2, { username: '테스트유저1' });
    });
  });

  describe('setPoints', () => {
    it('twitchId로 사용자의 포인트를 설정해야 한다', async () => {
      repository.update = jest.fn(async ({ twitchId } = {}) => !!twitchId);

      const result = await service.setPoints('testuser1', '테스트유저1', {
        ticket: 10,
        ticketPiece: 12,
      });

      expect(result).toBe(true);
      expect(repository.update).toBeCalledTimes(1);
      expect(repository.update).toBeCalledWith(
        { twitchId: 'testuser1' },
        { ticket: 10, ticketPiece: 12 },
      );
    });

    it('twitchId로 사용자를 조회할 수 없으면 username으로 포인트를 설정해야 한다', async () => {
      repository.update = jest.fn(async ({ username } = {}) => !!username);

      const result = await service.setPoints('testuser1', '테스트유저1', {
        ticket: 10,
        ticketPiece: 12,
      });

      expect(result).toBe(true);
      expect(repository.update).toBeCalledTimes(2);
      expect(repository.update).toBeCalledWith(
        { twitchId: 'testuser1' },
        { ticket: 10, ticketPiece: 12 },
      );
      expect(repository.update).toBeCalledWith(
        { username: '테스트유저1' },
        { ticket: 10, ticketPiece: 12 },
      );
    });

    it('존재하지 않는 유저는 false를 반환해야 한다.', async () => {
      repository.update = jest.fn(async () => false);

      const result = await service.setPoints('testuser1', '테스트유저1', {
        ticket: 10,
        ticketPiece: 12,
      });

      expect(result).toBe(false);
      expect(repository.update).toBeCalledTimes(2);
      expect(repository.update).toBeCalledWith(
        { twitchId: 'testuser1' },
        { ticket: 10, ticketPiece: 12 },
      );
      expect(repository.update).toBeCalledWith(
        { username: '테스트유저1' },
        { ticket: 10, ticketPiece: 12 },
      );
    });
  });

  describe('setPointsWithTwitchId', () => {
    it('twitchId로 사용자의 포인트를 설정해야 한다', async () => {
      repository.update = jest.fn(async () => true);

      const result = await service.setPointsWithTwitchId('testuser1', {
        ticket: 10,
        ticketPiece: 12,
      });

      expect(result).toBe(true);
      expect(repository.update).toBeCalledWith(
        { twitchId: 'testuser1' },
        { ticket: 10, ticketPiece: 12 },
      );
    });

    it('존재하지 않는 유저는 false를 반환해야 한다.', async () => {
      repository.update = jest.fn(async () => false);

      const result = await service.setPointsWithTwitchId('testuser1', {
        ticket: 10,
        ticketPiece: 12,
      });

      expect(result).toBe(false);
      expect(repository.update).toBeCalledWith(
        { twitchId: 'testuser1' },
        { ticket: 10, ticketPiece: 12 },
      );
    });
  });

  describe('setPointsWithUsername', () => {
    it('username으로 사용자의 포인트를 설정해야 한다', async () => {
      repository.update = jest.fn(async () => true);

      const result = await service.setPointsWithUsername('테스트유저1', {
        ticket: 10,
        ticketPiece: 12,
      });

      expect(result).toBe(true);
      expect(repository.update).toBeCalledWith(
        { username: '테스트유저1' },
        { ticket: 10, ticketPiece: 12 },
      );
    });

    it('존재하지 않는 유저는 false를 반환해야 한다.', async () => {
      repository.update = jest.fn(async () => false);

      const result = await service.setPointsWithUsername('테스트유저1', {
        ticket: 10,
        ticketPiece: 12,
      });

      expect(result).toBe(false);
      expect(repository.update).toBeCalledWith(
        { username: '테스트유저1' },
        { ticket: 10, ticketPiece: 12 },
      );
    });
  });

  describe('getViewerByTwitchId', () => {
    it('twitchId로 사용자를 조회할 수 있어야 한다', async () => {
      const expected = getTestViewer();
      repository.findOne = jest.fn(async () => expected);

      const result = await service.getViewerByTwitchId('testuser1');

      expect(result).toMatchObject(expected);
      expect(repository.findOne).toBeCalledWith({ twitchId: 'testuser1' });
    });

    it('존재하지 않는 유저는 undefined를 반환해야 한다', async () => {
      repository.findOne = jest.fn(async () => null);

      const result = await service.getViewerByTwitchId('testuser1');

      expect(result).toBeNull();
      expect(repository.findOne).toBeCalledWith({ twitchId: 'testuser1' });
    });
  });

  describe('getViewerByUsername', () => {
    it('username으로 사용자를 조회할 수 있어야 한다', async () => {
      const expected = getTestViewer();
      repository.findOne = jest.fn(async () => expected);

      const result = await service.getViewerByUsername('테스트유저1');

      expect(result).toMatchObject(expected);
      expect(repository.findOne).toBeCalledWith({ username: '테스트유저1' });
    });

    it('존재하지 않는 유저는 undefined를 반환해야 한다', async () => {
      repository.findOne = jest.fn(async () => null);

      const result = await service.getViewerByUsername('테스트유저1');

      expect(result).toBeNull();
      expect(repository.findOne).toBeCalledWith({ username: '테스트유저1' });
    });
  });
});
