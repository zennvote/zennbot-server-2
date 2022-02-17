import { Test, TestingModule } from '@nestjs/testing';
import { ViewersService } from './viewers.service';

describe('ViewersService', () => {
  let service: ViewersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ViewersService],
    }).compile();

    service = module.get<ViewersService>(ViewersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
