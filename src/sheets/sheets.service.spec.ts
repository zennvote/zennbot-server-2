import { Test, TestingModule } from '@nestjs/testing';
import { SheetsService } from './sheets.service';

describe('SheetsService', () => {
  let service: SheetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SheetsService],
    }).compile();

    service = module.get<SheetsService>(SheetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
