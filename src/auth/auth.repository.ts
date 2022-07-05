import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from 'src/users/entities/user.entity';
import { UserDataModel } from 'src/users/entities/user.datamodel';
import { InjectRepository } from '@nestjs/typeorm';

const salt = 12;

@Injectable()
export class AuthRepository {
  constructor(@InjectRepository(UserDataModel) private userDataModelsRepository: Repository<UserDataModel>) {}

  async checkPassword(user: User, password: string): Promise<boolean> {
    const userDataModel = await this.userDataModelsRepository.findOne(user.id);
    if (!userDataModel) {
      return false;
    }

    const result = await bcrypt.compare(password, userDataModel.password);

    return result;
  }

  async createPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
}
