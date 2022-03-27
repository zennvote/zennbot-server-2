import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  async findOne(username: string): Promise<User | null> {
    return null;
  }
}
