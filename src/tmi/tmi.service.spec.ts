import { Test, TestingModule } from '@nestjs/testing';
import { TmiService } from './tmi.service';

describe('TmiService', () => {
  let service: TmiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TmiService],
    }).compile();

    service = module.get<TmiService>(TmiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
