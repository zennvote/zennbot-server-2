import { Injectable } from '@nestjs/common';
import { AccountProps } from 'src/domain/accounts/accounts.entity';
import { PrismaService } from 'src/libs/prisma/prisma.service';

@Injectable()
export class AccountQuery {
  constructor(private readonly prisma: PrismaService) {}

  async sync(data: AccountProps) {
    await this.prisma.accounts.upsert({
      create: data,
      update: data,
      where: { id: data.id },
    });
  }

  async syncAll(data: AccountProps[]) {
    const targetIds = data.map(({ id }) => id);

    return this.prisma.$transaction(async (transaction) => {
      const existingIds = await transaction.accounts.findMany({
        select: { id: true },
        where: { id: { in: targetIds } },
      });
      const [exsitingTarget, nonExistingTarget] = data.reduce((acc, target) => {
        if (existingIds.some(({ id }) => id === target.id)) {
          return [[...acc[0], target], acc[1]];
        }

        return [acc[0], [...acc[1], target]];
      }, [[], []] as AccountProps[][]);

      const updateResult = await Promise.all(exsitingTarget.map((target) => (
        transaction.accounts.update({ where: { id: target.id }, data: target })
      )));
      const createdResult = await transaction.accounts.createMany({ data: nonExistingTarget });

      return { updated: updateResult.length, created: createdResult.count };
    });
  }

  async findOne(username: string, twitchId?: string) {
    const datamodel = await this.prisma.accounts.findFirst({
      where: { username, twitchId },
    });

    return datamodel;
  }
}
