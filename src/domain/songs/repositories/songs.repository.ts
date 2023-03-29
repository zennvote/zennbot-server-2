import { Song } from '../entities/songs.entity';

export const SONG_REPOSITORY = 'SONG_REPOSITORY';

export interface SongsRepository {
  save(song: Song): Promise<Song>;
}
