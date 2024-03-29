import { Test, TestingModule } from '@nestjs/testing';
import 'jest-extended';
import { sheets_v4 as sheetsV4 } from 'googleapis';

import { SheetsService } from './sheets.service';
import { SHEETS_CLIENT } from './sheets.types';

describe('SheetsService', () => {
  const sheetsRequest = {
    spreadsheetId: 'sheets',
    columns: ['twitchId', 'username', 'ticketPiece', 'ticket', 'prefix'] as const,
    startRow: 6,
  };

  let service: SheetsService;
  let sheetsClient: sheetsV4.Sheets;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SheetsService,
        { provide: SHEETS_CLIENT, useValue: { spreadsheets: { values: {} } } },
      ],
    }).compile();

    service = module.get<SheetsService>(SheetsService);
    sheetsClient = module.get<sheetsV4.Sheets>(SHEETS_CLIENT);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(sheetsClient).toBeDefined();
    expect(sheetsClient?.spreadsheets?.values).toBeDefined();
  });

  describe('getSheets', () => {
    it('시트 정보를 가져올 수 있어야 한다.', async () => {
      const values = [
        ['testviewer1', '테스트유저1', '14', '9'],
        ['testviewer2', '테스트유저2', '0', '7', '테스트'],
        ['testviewer3', '테스트유저3', '3', '13'],
      ];
      sheetsClient.spreadsheets.values.get = jest.fn().mockResolvedValue({ data: { values } });

      const result = await service.getSheets(sheetsRequest);

      expect(result).toMatchObject([
        {
          index: 0, twitchId: 'testviewer1', username: '테스트유저1', ticketPiece: '14', ticket: '9',
        },
        {
          index: 1, twitchId: 'testviewer2', username: '테스트유저2', ticketPiece: '0', ticket: '7', prefix: '테스트',
        },
        {
          index: 2, twitchId: 'testviewer3', username: '테스트유저3', ticketPiece: '3', ticket: '13',
        },
      ]);
    });
  });

  describe('updateSheets', () => {
    it('시트의 특정 row를 수정할 수 있어야 한다.', async () => {
      const updateMock = jest.fn().mockResolvedValue({
        data: { updatedData: { values: [['testviewer7', 'testviewer7', '12', '16', undefined]] } },
      });
      sheetsClient.spreadsheets.values.update = updateMock;

      await service.updateSheets(sheetsRequest, 7, { ticket: 12, ticketPiece: 16, twitchId: 'testviewer7' });

      expect(updateMock).toBeCalled();
      expect(updateMock.mock.calls[0][0].range).toBe('A13:E13');
      expect(updateMock.mock.calls[0][0].requestBody.values).toMatchObject([[
        'testviewer7',
        undefined,
        16,
        12,
        undefined,
      ]]);
    });
  });
});
