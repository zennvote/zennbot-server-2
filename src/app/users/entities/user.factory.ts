import { randomUUID } from 'crypto';

import { Prisma } from '@prisma/client';
import { Factory } from 'fishery';

import { User } from './user.entity';

class UserFactory extends Factory<User> {
  persist(prisma: Prisma.TransactionClient) {
    return this.onCreate(async (user) => {
      await prisma.user.create({ data: { ...user, password: 'pw' } });

      return user;
    });
  }
}

export const userFactory = UserFactory.define(
  ({ params }) => {
    const id = params.id ?? randomUUID();
    const user = new User();

    user.id = id;
    user.username = params.username ?? `testuser${id}`;

    return user;
  },
);
