import { Test, TestingModule } from '@nestjs/testing';
import { SheetsService } from 'src/libs/sheets/sheets.service';
import { Viewer } from './viewers.entity';
import { ViewersRepository } from './viewers.repository';

describe('ViewersRepository', () => {
  let repository: ViewersRepository;
  let sheetsService: SheetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ViewersRepository, { provide: SheetsService, useValue: {} }],
    }).compile();

    repository = module.get<ViewersRepository>(ViewersRepository);
    sheetsService = module.get<SheetsService>(SheetsService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(sheetsService).toBeDefined();
  });

  describe('find', () => {
    it('유저 목록을 반환해야 한다.', async () => {
      sheetsService.getSheets = jest.fn().mockResolvedValue([
        { index: 1, twitchId: 'viewer1', username: '시청자1', ticketPiece: '3', ticket: '1' },
        { index: 2, twitchId: 'viewer2', username: '시청자2', ticketPiece: '6', ticket: '2' },
        { index: 3, twitchId: 'viewer3', username: '시청자3', ticketPiece: '9', ticket: '3', prefix: 'sample prefix' },
      ]);

      const result = await repository.find();

      result.forEach((result, index) => {
        expect(result).toHaveProperty('index', index + 1);
        expect(result).toHaveProperty('twitchId', `viewer${index + 1}`);
        expect(result).toHaveProperty('username', `시청자${index + 1}`);
        expect(result).toHaveProperty('ticketPiece', (index + 1) * 3);
        expect(result).toHaveProperty('ticket', index + 1);
        expect(result).toBeInstanceOf(Viewer);
      });

      expect(result[2]).toHaveProperty('prefix', 'sample prefix');
    });
  });

  describe('findOne', () => {
    it('조건에 맞는 유저를 찾을 수 있어야 한다', async () => {
      sheetsService.getSheets = jest.fn().mockResolvedValue([
        { index: 1, twitchId: 'viewer1', username: '시청자1', ticketPiece: '3', ticket: '1' },
        { index: 2, twitchId: 'viewer2', username: '시청자2', ticketPiece: '6', ticket: '2' },
        { index: 3, twitchId: 'viewer3', username: '시청자3', ticketPiece: '9', ticket: '3', prefix: 'sample prefix' },
      ]);

      const result = await repository.findOne({ twitchId: 'viewer2' });

      expect(result).toHaveProperty('index', 2);
      expect(result).toHaveProperty('twitchId', 'viewer2');
      expect(result).toHaveProperty('username', '시청자2');
      expect(result).toHaveProperty('ticketPiece', 6);
      expect(result).toHaveProperty('ticket', 2);
      expect(result).toBeInstanceOf(Viewer);
    });

    it('조건에 맞는 유저가 없을 시 null을 반환한다.', async () => {
      sheetsService.getSheets = jest.fn().mockResolvedValue([
        { index: 1, twitchId: 'viewer1', username: '시청자1', ticketPiece: '3', ticket: '1' },
        { index: 2, twitchId: 'viewer2', username: '시청자2', ticketPiece: '6', ticket: '2' },
        { index: 3, twitchId: 'viewer3', username: '시청자3', ticketPiece: '9', ticket: '3', prefix: 'sample prefix' },
      ]);

      const result = await repository.findOne({ twitchId: 'non-exist-user' });

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const sheetsInfo = {
      spreadsheetId: undefined,
      columns: ['twitchId', 'username', 'ticketPiece', 'ticket', 'prefix'] as const,
      startRow: 6,
    };

    it('조건에 맞는 유저를 업데이트할 수 있어야 한다', async () => {
      sheetsService.getSheets = jest.fn().mockResolvedValue([
        { index: 1, twitchId: 'viewer1', username: '시청자1', ticketPiece: '3', ticket: '1' },
        { index: 2, twitchId: 'viewer2', username: '시청자2', ticketPiece: '6', ticket: '2' },
        { index: 3, twitchId: 'viewer3', username: '시청자3', ticketPiece: '9', ticket: '3', prefix: 'sample prefix' },
      ]);
      sheetsService.updateSheets = jest.fn();

      const result = await repository.update({ twitchId: 'viewer2' }, { ticket: 10, ticketPiece: 15 });

      expect(sheetsService.updateSheets).toBeCalledWith(sheetsInfo, 2, { ticket: 10, ticketPiece: 15 });
      expect(result).toBe(true);
    });

    it('조건에 맞는 유저가 없을 시 false를 반환한다', async () => {
      sheetsService.getSheets = jest.fn().mockResolvedValue([
        { index: 1, twitchId: 'viewer1', username: '시청자1', ticketPiece: '3', ticket: '1' },
        { index: 2, twitchId: 'viewer2', username: '시청자2', ticketPiece: '6', ticket: '2' },
        { index: 3, twitchId: 'viewer3', username: '시청자3', ticketPiece: '9', ticket: '3', prefix: 'sample prefix' },
      ]);
      sheetsService.updateSheets = jest.fn();

      const result = await repository.update({ twitchId: 'viewer4' }, { ticket: 10, ticketPiece: 15 });

      expect(sheetsService.updateSheets).toBeCalledTimes(0);
      expect(result).toBe(false);
    });

    it('index로 조회 시 전체 목록 조회를 스킵하고 조회할 수 있어햐 한다', async () => {
      sheetsService.getSheets = jest.fn();
      sheetsService.updateSheets = jest.fn();

      const result = await repository.update({ index: 3 }, { ticket: 10, ticketPiece: 15 });

      expect(sheetsService.updateSheets).toBeCalledWith(sheetsInfo, 3, { ticket: 10, ticketPiece: 15 });
      expect(sheetsService.getSheets).toBeCalledTimes(0);
      expect(result).toBe(true);
    });
  });
});
