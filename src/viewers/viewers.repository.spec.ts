import { Test, TestingModule } from '@nestjs/testing';
import { SheetsService } from 'src/sheets/sheets.service';
import { ViewersRepository } from './viewers.repository';

describe('ViewersRepository', () => {
  let repository: ViewersRepository;

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
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
