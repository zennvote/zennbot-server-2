import { Test, TestingModule } from '@nestjs/testing';
import { ViewersController } from './viewers.controller';

describe('ViewersController', () => {
  let controller: ViewersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewersController],
    }).compile();

    controller = module.get<ViewersController>(ViewersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
