import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { ManagersService } from './managers.service';

describe('ManagersService', () => {
  let service: ManagersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManagersService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ManagersService>(ManagersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
