import { Injectable } from '@nestjs/common';

import { Song } from 'src/domain/songs/songs.entity';

@Injectable()
export class SongsRepository {
  async getRequestedSongs(): Promise<Song[]> {
    throw new Error('not implemented');
  }

  async getCooltimeSongs(): Promise<Song[]> {
    throw new Error('not implemented');
  }
}
