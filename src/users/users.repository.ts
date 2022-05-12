import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDataModel } from './entities/user.datamodel';

import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(UserDataModel) private userDataModelsRepository: Repository<UserDataModel>) {}

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.userDataModelsRepository.findOne({ where: { username } });
    if (!result) {
      return null;
    }

    const user = new User();
    user.id = result.id;
    user.username = result.username;

    return user;
  }
}
