import { SongRequestor } from '../entities/song-requestor.entity';

export const SONG_REQUESTOR_REPOSITORY = 'SONG_REQUESTOR_REPOSITORY';

export interface SongRequestorRepository {
  get(twitchId: string, username: string): Promise<SongRequestor | null>;
  save(songRequestor: SongRequestor): Promise<SongRequestor>;
}
