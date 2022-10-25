import { Injectable } from '@nestjs/common';
import { Viewer as ViewerDataModel } from '@prisma/client';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { AccountsRepository } from 'src/infrastructure/persistence/accounts/accounts.repository';

import { Viewer } from 'src/domain/viewers/viewers.entity';
import { ViewersRepository as ViewersRepositoryInterface } from 'src/domain/viewers/viewers.repository';

@Injectable()
export class ViewersRepository implements ViewersRepositoryInterface {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsRepository: AccountsRepository,
  ) {}

  public async isExisting(twitchId: string): Promise<boolean> {
    const result = await this.prisma.viewer.findFirst({ where: { twitchId } });

    return result !== null;
  }

  public async findOne(twitchId: string, username: string): Promise<Viewer | null> {
    const result = await this.prisma.viewer.findFirst({
      where: { OR: [{ twitchId }, { username }] },
    });

    if (!result) {
      const account = await this.accountsRepository.findByTwitchIdAndUsername(twitchId, username);
      if (!account) return null;

      return this.create(new Viewer({
        id: -1, twitchId, username, accountId: account.id,
      }));
    }

    return convertFromDataModel(result);
  }

  public async save(viewer: Viewer): Promise<Viewer> {
    if (!viewer.persisted) {
      return this.create(viewer);
    }

    const result = await this.prisma.viewer.update({
      data: viewer,
      where: { id: viewer.id },
    });

    return convertFromDataModel(result);
  }

  private async create(viewer: Viewer): Promise<Viewer> {
    const result = await this.prisma.viewer.create({
      data: {
        ...viewer, id: undefined,
      },
    });

    return convertFromDataModel(result);
  }
}

const convertFromDataModel = (datamodel: ViewerDataModel) => new Viewer({
  id: datamodel.id,
  twitchId: datamodel.twitchId,
  username: datamodel.twitchId,
  accountId: datamodel.accountId,
});
