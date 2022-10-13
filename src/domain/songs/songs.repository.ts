import { Song } from 'src/domain/songs/songs.entity';

export interface SongsRepository {
  save(song: Song): Promise<Song>;
  getRequestedSongs(): Promise<Song[]>;
  getCooltimeSongs(): Promise<Song[]>;
}
