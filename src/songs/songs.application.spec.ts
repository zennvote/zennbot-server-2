import { Test } from '@nestjs/testing';

import { ViewersService } from 'src/viewers/viewers.service';

import { SongsApplication } from './songs.application';
import { SongsService } from './songs.service';

describe('SongsApplication', () => {
  let app: SongsApplication;
  let service: SongsService;
  let viewersService: ViewersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SongsApplication, { provide: SongsService, useValue: {} }, { provide: ViewersService, useValue: {} }],
    }).compile();

    app = module.get(SongsApplication);
    service = module.get(SongsService);
    viewersService = module.get(ViewersService);
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(service).toBeDefined();
    expect(viewersService).toBeDefined();
  });
});
