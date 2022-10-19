import { Injectable } from '@nestjs/common';

import { BusinessError } from 'src/util/business-error';

import { CreateSongDto } from './dtos/create-song.dto';
import Song from './songs.entity';
import { SongsRepository } from './songs.repository';

@Injectable()
export class SongsService {
  constructor(private readonly songsRepository: SongsRepository) {}

  get requestedSongsObserver() {
    return this.songsRepository.requestedSongsObserver;
  }

  get cooltimeSongsObserver() {
    return this.songsRepository.cooltimeSongsObserver;
  }

  async getSongs() {
    return this.songsRepository.getRequestedSongs();
  }

  async getCooltimeSongs() {
    return this.songsRepository.getCooltimeSongs();
  }

  async skipSong() {
    const [song, ...remainSongs] = await this.songsRepository.getRequestedSongs();
    const cooltimeSongs = await this.songsRepository.getCooltimeSongs();

    if (!song) {
      return new BusinessError('empty-list');
    }

    await this.songsRepository.setRequestedSongs(remainSongs);
    await this.songsRepository.setCooltimeSongs([...cooltimeSongs, song]
      .slice(cooltimeSongs.length >= 4 ? 1 : 0));

    return song;
  }

  async resetSongs() {
    await this.songsRepository.setCooltimeSongs([]);
    await this.songsRepository.setRequestedSongs([]);
  }

  async isCooltime(twitchId: string): Promise<boolean> {
    const cooltimeSongs = await this.songsRepository.getCooltimeSongs();
    const requestedSongs = await this.songsRepository.getRequestedSongs();

    return [...cooltimeSongs, ...requestedSongs]
      .slice(-4)
      .some((song) => song.requestor === twitchId);
  }

  async enqueueSong(createSongDto: CreateSongDto): Promise<Song> {
    const {
      title, requestor, requestorName, requestType,
    } = createSongDto;
    const song = new Song(title, requestor, requestorName, requestType);

    const requestedSongs = await this.songsRepository.getRequestedSongs();
    await this.songsRepository.setRequestedSongs([...requestedSongs, song]);

    return song;
  }

  async deleteSong(index: number) {
    const songs = await this.songsRepository.getRequestedSongs();
    if (songs.length <= index) {
      return new BusinessError('out-of-range');
    }

    const [deleted] = songs.splice(index, 1);
    await this.songsRepository.setRequestedSongs(songs);

    return deleted;
  }

  async resetRequestedSongs() {
    await this.songsRepository.setRequestedSongs([]);
  }

  async reindexSong(indexes: number[]) {
    const songs = await this.songsRepository.getRequestedSongs();
    if (songs.length !== indexes.length) {
      return new BusinessError('out-of-range');
    }

    const reindexed = indexes.map((index) => songs[index]);
    await this.songsRepository.setRequestedSongs(reindexed);

    return reindexed;
  }

  async resetCooltimeSongs() {
    await this.songsRepository.setCooltimeSongs([]);
  }
}
