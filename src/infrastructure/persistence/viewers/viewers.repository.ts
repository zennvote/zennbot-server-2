import { Injectable } from '@nestjs/common';
import { Viewer } from 'src/domain/viewers/viewers.entity';

@Injectable()
export class ViewersRepository {
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
