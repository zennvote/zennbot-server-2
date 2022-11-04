import { Viewer } from './viewers.entity';

export interface ViewersRepository {
  findOne(twitchId: string, username: string): Promise<Viewer | null>;
  findOneByUsername(username: string): Promise<Viewer | null>;
  findByBiasIdols(idolId: number): Promise<Viewer[]>
  save(viewer: Viewer): Promise<Viewer>;
}
