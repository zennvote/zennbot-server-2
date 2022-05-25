import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Subject } from 'rxjs';

import Song from './songs.entity';

const RequestedSongsKey = 'songs:requested-songs';
const CooltimeSongsKey = 'songs:cooltime-songs';

@Injectable()
export class SongsRepository {
  private readonly requestedSongsSubject = new Subject<Song[]>();
  public requestedSongsObserver = this.requestedSongsSubject.asObservable();

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getRequestedSongs() {
    return this.getSongs(RequestedSongsKey);
  }

  async getCooltimeSongs() {
    return this.getSongs(CooltimeSongsKey);
  }

  private async getSongs(key: string) {
    const songsJson = await this.cacheManager.get<string>(key);
    const results: any[] = JSON.parse(songsJson ?? '[]');
    const songs = results.map(
      (result) => new Song(result.title, result.requestor, result.requestorName, result.requestType),
    );

    return songs;
  }

  async setRequestedSongs(songs: Song[]) {
    const result = await this.setSongs(RequestedSongsKey, songs);

    this.requestedSongsSubject.next(songs);

    return result;
  }

  async setCooltimeSongs(songs: Song[]) {
    return this.setSongs(CooltimeSongsKey, songs);
  }

  private async setSongs(key: string, songs: Song[]) {
    const songsJson = JSON.stringify(songs);

    await this.cacheManager.set(key, songsJson);

    return songs;
  }
}
