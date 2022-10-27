import { Viewer } from './viewers.entity';

export interface ViewersRepository {
  isExisting(twitchId: string): Promise<boolean>;
  findOne(twitchId: string, username: string): Promise<Viewer | null>;
  findByBiasIdols(idolId: number): Promise<Viewer[]>
  save(viewer: Viewer): Promise<Viewer>;
}
