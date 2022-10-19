import { Viewer } from './viewers.entity';

export interface ViewersRepository {
  isExisting(twitchId: string): Promise<boolean>;
  findOne(twitchId: string): Promise<Viewer | null>;
  save(viewer: Viewer): Promise<Viewer>;
}
