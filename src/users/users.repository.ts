import { Injectable } from '@nestjs/common';

import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  async findByUsername(username: string): Promise<User | null> {
    return null;
  }
}
