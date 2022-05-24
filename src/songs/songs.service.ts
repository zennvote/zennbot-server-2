import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

import { SongsRepository } from './songs.repository';
import Song from './songs.entity';
import { CreateSongDto } from './dtos/create-song.dto';

@Injectable()
export class SongsService {
  private readonly requestedSongsSubject = new Subject<Song[]>();
  public requestedSongsObserver = this.requestedSongsSubject.asObservable();

  constructor(private readonly songsRepository: SongsRepository) {}

  async getRequestedSongs() {
    return this.songsRepository.getRequestedSongs();
  }

  async getCooltimeSongs() {
    return this.songsRepository.getCooltimeSongs();
  }

  async skipSong(): Promise<Song> {
    const [song, ...remainSongs] = await this.songsRepository.getRequestedSongs();
    const cooltimeSongs = await this.songsRepository.getCooltimeSongs();

    await this.songsRepository.setRequestedSongs(remainSongs);
    await this.songsRepository.setCooltimeSongs([...cooltimeSongs, song].slice(cooltimeSongs.length >= 4 ? 1 : 0));

    return song;
  }

  async isCooltime(twitchId: string): Promise<boolean> {
    const cooltimeSongs = await this.songsRepository.getCooltimeSongs();
    const requestedSongs = await this.songsRepository.getRequestedSongs();

    return [...cooltimeSongs, ...requestedSongs].slice(-4).some((song) => song.requestor === twitchId);
  }

  async enqueueSong(createSongDto: CreateSongDto): Promise<Song> {
    const { title, requestor, requestorName, requestType } = createSongDto;
    const song = new Song(title, requestor, requestorName, requestType);

    const requestedSongs = await this.songsRepository.getRequestedSongs();
    await this.songsRepository.setRequestedSongs([...requestedSongs, song]);

    return song;
  }

  async deleteSong(index: number): Promise<Song> {
    const songs = await this.songsRepository.getRequestedSongs();
    const [deleted] = songs.splice(index, 1);

    await this.songsRepository.setRequestedSongs(songs);

    return deleted;
  }

  async resetRequestedSongs() {
    await this.songsRepository.setRequestedSongs([]);
  }

  async resetCooltimeSongs() {
    await this.songsRepository.setCooltimeSongs([]);
  }
}
