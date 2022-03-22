import { Test, TestingModule } from '@nestjs/testing';
import { ManagersService } from 'src/managers/managers.service';
import { ViewersController } from './viewers.controller';
import { ViewersService } from './viewers.service';

describe('ViewersController', () => {
  let controller: ViewersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewersController],
      providers: [
        {
          provide: ViewersService,
          useValue: {},
        },
        {
          provide: ManagersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ViewersController>(ViewersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
