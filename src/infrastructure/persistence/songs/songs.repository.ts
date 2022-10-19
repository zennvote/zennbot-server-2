import { Injectable } from '@nestjs/common';

import { Song } from 'src/domain/songs/songs.entity';
import { SongsRepository as SongsRepositoryInterface } from 'src/domain/songs/songs.repository';

@Injectable()
export class SongsRepository implements SongsRepositoryInterface {
  async save(song: Song): Promise<Song> {
    throw new Error('not implemented');
  }

  async getRequestedSongs(): Promise<Song[]> {
    throw new Error('not implemented');
  }

  async getCooltimeSongs(): Promise<Song[]> {
    throw new Error('not implemented');
  }
}
