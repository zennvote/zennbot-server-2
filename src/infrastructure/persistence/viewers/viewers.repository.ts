import { Injectable } from '@nestjs/common';
import { Viewer } from 'src/domain/viewers/viewers.entity';
import { ViewersRepository as ViewersRepositoryInterface } from 'src/domain/viewers/viewers.repository';

@Injectable()
export class ViewersRepository implements ViewersRepositoryInterface {
  public async isExisting(twitchId: string): Promise<boolean> {
    throw new Error('not implemented');
  }

  public async findOne(twitchId: string): Promise<Viewer | null> {
    throw new Error('not implemented');
  }

  public async save(viewer: Viewer): Promise<Viewer> {
    throw new Error('not implemented');
  }
}
