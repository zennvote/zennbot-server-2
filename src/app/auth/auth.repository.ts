import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { User } from 'src/app/users/entities/user.entity';

const salt = 12;

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async checkPassword(user: User, password: string): Promise<boolean> {
    const userDataModel = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!userDataModel) {
      return false;
    }

    const result = await bcrypt.compare(password, userDataModel.password);

    return result;
  }

  static async createPassword(password: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
