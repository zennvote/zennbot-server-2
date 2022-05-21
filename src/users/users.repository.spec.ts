;import { createTestDbConnection } from 'src/test-utils';
import { Connection, Repository } from 'typeorm';
import { UserDataModel } from './entities/user.datamodel';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

describe('UserRepository', () => {
  let db: Connection;
  let repository: UsersRepository;
  let typeormRepository: Repository<UserDataModel>;

  beforeEach(async () => {
    db = await createTestDbConnection([UserDataModel]);
    typeormRepository = await db.getRepository(UserDataModel);
    repository = new UsersRepository(typeormRepository);
  });

  afterEach(() => db.close());

  describe('findByUsername', () => {
    it('username에 맞는 유저를 반환해야 한다.', async () => {
      await typeormRepository.save(
        typeormRepository.create([
          { id: 1, username: 'testuser1', password: 'password1' },
          { id: 2, username: 'testuser2', password: 'password2' },
          { id: 3, username: 'testuser3', password: 'password3' },
          { id: 4, username: 'testuser4', password: 'password4' },
        ]),
      );

      const result = await repository.findByUsername('testuser2');

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(2);
      expect(result.username).toBe('testuser2');
    });

    it('username에 맞는 유저가 없을 시 null을 반환해야 한다.', async () => {
      await typeormRepository.save(
        typeormRepository.create([
          { id: 1, username: 'testuser1', password: 'password1' },
          { id: 2, username: 'testuser2', password: 'password2' },
          { id: 3, username: 'testuser3', password: 'password3' },
          { id: 4, username: 'testuser4', password: 'password4' },
        ]),
      );

      const result = await repository.findByUsername('nouser');

      expect(result).toBeNull();
    });
  });
});
