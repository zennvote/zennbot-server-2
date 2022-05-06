import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const getTestUser = () => {
  const user = new User();
  user.id = 1;
  user.username = 'testuser1';
  return user;
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, UsersRepository],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('유저를 반환해야 한다.', async () => {
      const expected = getTestUser();
      repository.findByUsername = jest.fn(async () => expected);

      const result = await service.findOne('testuser1');

      expect(result).toMatchObject(expected);
    });

    it('해당 유저가 없을 시 null을 반환해야 한다.', async () => {
      repository.findByUsername = jest.fn(async () => null);

      const result = await service.findOne('testuser1');

      expect(result).toBeNull();
    });
  });
});
