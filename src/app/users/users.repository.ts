import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { UserDataModel } from './entities/user.datamodel';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.prisma.user.findUnique({ where: { username } });
    if (!result) {
      return null;
    }

    const user = new User();
    user.id = result.id;
    user.username = result.username;

    return user;
  }

  async create(username: string, password: string) {
    const datamodel = new UserDataModel();
    datamodel.username = username;
    datamodel.password = password;

    const result = await this.prisma.user.create({ data: datamodel });

    const user = new User();
    user.id = result.id;
    user.username = result.username;

    return user;
  }
}
