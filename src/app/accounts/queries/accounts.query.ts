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

  async findOne(username: string, twitchId?: string) {
    const datamodel = await this.prisma.accounts.findFirst({
      where: { username, twitchId },
    });

    return datamodel;
  }
}
