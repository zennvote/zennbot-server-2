import { Injectable } from '@nestjs/common';

import { AuthRepository } from 'src/app/auth/auth.repository';

import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  async create(username: string, password: string): Promise<User> {
    const hashed = await AuthRepository.createPassword(password);

    return this.usersRepository.create(username, hashed);
  }
}
