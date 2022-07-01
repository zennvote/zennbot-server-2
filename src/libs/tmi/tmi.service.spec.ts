import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { TmiService } from './tmi.service';
import { TMI_CLIENT } from './tmi.types';

describe('TmiService', () => {
  let service: TmiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmiService,
        {
          provide: TMI_CLIENT,
          useFactory: () => ({
            on: jest.fn(),
          }),
        },
        {
          provide: EventEmitter2,
          useFactory: () => ({}),
        },
      ],
    }).compile();

    service = module.get<TmiService>(TmiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
