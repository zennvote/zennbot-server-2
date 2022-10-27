import { Injectable } from '@nestjs/common';
import { Viewer as ViewerDataModel } from '@prisma/client';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { Viewer } from 'src/domain/viewers/viewers.entity';
import { ViewersRepository as ViewersRepositoryInterface } from 'src/domain/viewers/viewers.repository';

@Injectable()
export class ViewersRepository implements ViewersRepositoryInterface {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  isExisting(twitchId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  findOne(twitchId: string, username: string): Promise<Viewer | null> {
    throw new Error('Method not implemented.');
  }

  findByBiasIdols(idolId: number): Promise<Viewer[]> {
    throw new Error('Method not implemented.');
  }

  save(viewer: Viewer): Promise<Viewer> {
    throw new Error('Method not implemented.');
  }
}
