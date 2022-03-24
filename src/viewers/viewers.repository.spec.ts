import { Test, TestingModule } from '@nestjs/testing';
import { SheetRow } from 'src/sheets/sheets.interface';
import { SheetsService } from 'src/sheets/sheets.service';
import { Viewer } from './viewers.entity';
import { ViewersRepository } from './viewers.repository';

describe('ViewersRepository', () => {
  let repository: ViewersRepository;
  let sheetsService: SheetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewersRepository,
        {
          provide: SheetsService,
          useFactory: () => ({}),
        },
      ],
    }).compile();

    repository = module.get<ViewersRepository>(ViewersRepository);
    sheetsService = module.get<SheetsService>(SheetsService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('find', () => {
    it('시트 정보를 가져와 Viewer 목록을 반환해야 한다', async () => {
      sheetsService.getSheets = jest.fn(
        async (): Promise<SheetRow[]> => [
          {
            index: 1,
            ticket: 10,
            ticketPiece: 12,
            twitchId: 'testuser1',
            username: '테스트유저1',
          },
          {
            index: 2,
            ticket: 6,
            ticketPiece: 0,
            twitchId: 'testuser2',
            username: '테스트유저2',
            prefix: '테스트 칭호',
          },
        ],
      );
      const expected = [
        new Viewer({
          index: 1,
          ticket: 10,
          ticketPiece: 12,
          twitchId: 'testuser1',
          username: '테스트유저1',
        }),
        new Viewer({
          index: 2,
          ticket: 6,
          ticketPiece: 0,
          twitchId: 'testuser2',
          username: '테스트유저2',
          prefix: '테스트 칭호',
        }),
      ];

      const result = await repository.find();

      expect(result).toMatchObject(expected);
      expect(result[0]).toBeInstanceOf(Viewer);
      expect(result[1]).toBeInstanceOf(Viewer);
    });
  });
});
