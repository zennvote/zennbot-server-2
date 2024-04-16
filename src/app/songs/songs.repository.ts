import {
  CACHE_MANAGER, Inject, Injectable, Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Subject } from 'rxjs';

import Song from './songs.entity';

const RequestedSongsKey = 'songs:requested-songs';
const CooltimeSongsKey = 'songs:cooltime-songs';

@Injectable()
export class SongsRepository {
  private readonly logger = new Logger(SongsRepository.name);

  private readonly requestedSongsSubject = new Subject<Song[]>();

  private readonly cooltimeSongsSubject = new Subject<Song[]>();

  public requestedSongsObserver = this.requestedSongsSubject.asObservable();

  public cooltimeSongsObserver = this.cooltimeSongsSubject.asObservable();

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

  async getRequestedSongs() {
    return this.getSongs(RequestedSongsKey);
  }

  async getCooltimeSongs() {
    return this.getSongs(CooltimeSongsKey);
  }

  private async getSongs(key: string) {
    const songsJson = await this.cacheManager.get<string>(key);

    this.logger.debug(`Get songs:${key}`, songsJson, 'SongCache');

    const results: any[] = JSON.parse(songsJson ?? '[]');
    const songs = results.map((result) => (
      new Song(result.title, result.requestor, result.requestorName, result.requestType)
    ));

    return songs;
  }

  async setRequestedSongs(songs: Song[]) {
    const result = await this.setSongs(RequestedSongsKey, songs);

    this.requestedSongsSubject.next(songs);

    return result;
  }

  async setCooltimeSongs(songs: Song[]) {
    const result = await this.setSongs(CooltimeSongsKey, songs);

    this.cooltimeSongsSubject.next(songs);

    return result;
  }

  private async setSongs(key: string, songs: Song[]) {
    const filtered = songs.filter((song) => song && song instanceof Song);
    const songsJson = JSON.stringify(filtered);

    this.logger.debug(`Set songs:${key}`, songsJson, 'SongCache');

    await this.cacheManager.set(key, songsJson);

    return filtered;
  }
}
