import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Subject } from 'rxjs';
import { CreateSongDto } from './dtos/create-song.dto';

import Song from './songs.entity';

@Injectable()
export class SongsService {
  private readonly requestedSongsSubject = new Subject<Song[]>();
  public requestedSongsObserver = this.requestedSongsSubject.asObservable();

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async skipSong(): Promise<Song> {
    const [song, ...remainSongs] = await this.getRequestedSongs();
    const cooltimeSongs = await this.getCooltimeSongs();

    await this.setRequestedSongs(remainSongs);
    await this.setCooltimeSongs([...cooltimeSongs, song].slice(cooltimeSongs.length >= 4 ? 1 : 0));

    return song;
  }

  async isCooltime(twitchId: string): Promise<boolean> {
    const cooltimeSongs = await this.getCooltimeSongs();
    const requestedSongs = await this.getRequestedSongs();

    return [...cooltimeSongs, ...requestedSongs].slice(-4).some((song) => song.requestor === twitchId);
  }

  async enqueueSong(createSongDto: CreateSongDto): Promise<Song> {
    const { title, requestor, requestorName, requestType } = createSongDto;
    const song = new Song(title, requestor, requestorName, requestType);

    const requestedSongs = await this.getRequestedSongs();
    await this.setRequestedSongs([...requestedSongs, song]);

    return song;
  }

  async deleteSong(index: number): Promise<Song> {
    const songs = await this.getRequestedSongs();
    const [deleted] = songs.splice(index, 1);

    await this.setRequestedSongs(songs);

    return deleted;
  }

  async reindexSong(indexes: number[]): Promise<Song[] | null> {
    const songs = await this.getRequestedSongs();
    if (songs.length !== indexes.length) {
      return null;
    }

    const reindexed = indexes.map((index) => songs[index]);
    await this.setRequestedSongs(reindexed);

    return reindexed;
  }

  async getRequestedSongs(): Promise<Song[]> {
    const songsJson = await this.cacheManager.get<string>('songs:requested-songs');

    return JSON.parse(songsJson ?? '[]');
  }

  async getCooltimeSongs(): Promise<Song[]> {
    const songsJson = await this.cacheManager.get<string>('songs:cooltime-songs');

    return JSON.parse(songsJson ?? '[]');
  }

  async resetRequestedSongs(): Promise<void> {
    await this.setRequestedSongs([]);
  }

  async resetCooltimeSongs(): Promise<void> {
    await this.setCooltimeSongs([]);
  }

  private async setRequestedSongs(songs: Song[]): Promise<Song[]> {
    const songsJson = JSON.stringify(songs);
    const result = await this.cacheManager.set('songs:requested-songs', songsJson);

    this.requestedSongsSubject.next(songs);

    return JSON.parse(result);
  }

  private async setCooltimeSongs(songs: Song[]): Promise<Song[]> {
    const songsJson = JSON.stringify(songs);
    const result = await this.cacheManager.set('songs:cooltime-songs', songsJson);

    return JSON.parse(result);
  }
}
