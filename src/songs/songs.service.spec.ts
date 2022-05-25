import { CACHE_MANAGER } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SongsRepository } from './songs.repository';
import { SongsService } from './songs.service';

describe('SongsService', () => {
  let service: SongsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SongsService, { provide: CACHE_MANAGER, useValue: {} }, { provide: SongsRepository, useValue: {} }],
    }).compile();

    service = module.get<SongsService>(SongsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
