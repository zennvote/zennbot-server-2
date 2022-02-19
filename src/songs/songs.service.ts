import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import Song from './songs.entity';

@Injectable()
export class SongsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getRequestedSongs(): Promise<Song[]> {
    const songsJson = await this.cacheManager.get<string>(
      'songs:requested-songs',
    );

    return JSON.parse(songsJson);
  }

  async setRequestedSongs(songs: Song[]): Promise<Song[]> {
    const songsJson = JSON.stringify(songs);
    const result = await this.cacheManager.set(
      'songs:requested-songs',
      songsJson,
    );

    return JSON.parse(result);
  }
}
