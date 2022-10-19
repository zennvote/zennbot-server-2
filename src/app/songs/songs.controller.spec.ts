import { Test, TestingModule } from '@nestjs/testing';

import { SongsApplication } from './songs.application';
import { SongsController } from './songs.controller';

describe('SongsController', () => {
  let controller: SongsController;
  let application: SongsApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [{ provide: SongsApplication, useValue: {} }],
    }).compile();

    controller = module.get<SongsController>(SongsController);
    application = module.get<SongsApplication>(SongsApplication);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(application).toBeDefined();
  });
});
