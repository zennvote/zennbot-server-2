import { Connection, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { createTestDbConnection } from 'src/test-utils';
import { UserDataModel } from 'src/users/entities/user.datamodel';
import { User } from 'src/users/entities/user.entity';
import { AuthRepository } from './auth.repository';

// hashed string of "password1"
// https://bcrypt-generator.com/
const hashedPassword = '$2a$12$4CoPFVAfxWFIATEPjWWY2e09zQBbTdDK68BxIkEHBPD4jO91KPRT6';

describe('AuthRepository', () => {
  let db: Connection;
  let repository: AuthRepository;
  let userTypeormRepository: Repository<UserDataModel>;

  beforeEach(async () => {
    db = await createTestDbConnection([UserDataModel]);
    userTypeormRepository = db.getRepository(UserDataModel);
    repository = new AuthRepository(userTypeormRepository);
  });

  afterEach(() => db.close());

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('checkPassword', () => {
    it('hash된 패스워드를 체크할 수 있어야 한다.', async () => {
      await userTypeormRepository.save(
        userTypeormRepository.create({ id: 1, username: 'testuser1', password: hashedPassword }),
      );

      const user = new User();
      user.id = 1;
      user.username = 'testuser1';

      const result = await repository.checkPassword(user, 'password1');

      expect(result).toBe(true);
    });
  });

  describe('createPassword', () => {
    it('패스워드를 hash하여 암호화된 비밀번호를 반환해야 한다.', async () => {
      const result = await repository.createPassword('password1');

      const check = await bcrypt.compare('password1', result);

      expect(check).toBe(true);
    });
  });
});
