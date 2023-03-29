import { Inject, Injectable } from '@nestjs/common';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import { SongRequestor } from 'src/domain/songs/entities/song-requestor.entity';
import { SONG_QUEUE_REPOSITORY, SongQueueRepository } from 'src/domain/songs/repositories/song-queue.repository';
import { SONG_REQUESTOR_REPOSITORY, SongRequestorRepository } from 'src/domain/songs/repositories/song-requestor.repository';
import { SONG_REPOSITORY, SongsRepository } from 'src/domain/songs/repositories/songs.repository';

@Injectable()
export class SongsApplication {
  constructor(
    @Inject(SONG_REPOSITORY) private readonly songsRepository: SongsRepository,
    @Inject(SONG_QUEUE_REPOSITORY) private readonly songQueueRepository: SongQueueRepository,
    @Inject(SONG_REQUESTOR_REPOSITORY)
    private readonly songRequestorRepository: SongRequestorRepository,
  ) {}

  public async getSongs() {
    const songQueue = await this.songQueueRepository.get();

    return songQueue.requestedSongs;
  }

  public async getCooltimes() {
    const songQueue = await this.songQueueRepository.get();

    return songQueue.consumedSongs;
  }

  public async requestSong(twitchId: string, username: string, title: string) {
    const songQueue = await this.songQueueRepository.get();
    const requestor = await this.songRequestorRepository.get(twitchId, username);
    if (requestor === null) return new BusinessError('requestor-not-found');

    const song = songQueue.request(title, requestor);
    if (isBusinessError(song)) return song;

    const [persisted] = await Promise.all([
      await this.songsRepository.save(song),
      await this.songQueueRepository.save(songQueue),
      await this.songRequestorRepository.save(requestor),
    ]);

    return persisted;
  }

  public async appendManualSong(title: string) {
    const songQueue = await this.songQueueRepository.get();
    const song = songQueue.appendManualSong(title);

    const [persisted] = await Promise.all([
      await this.songsRepository.save(song),
      await this.songQueueRepository.save(songQueue),
    ]);

    return persisted;
  }

  public async reindexSongs(ids: string[]) {
    const songQueue = await this.songQueueRepository.get();

    const result = songQueue.reindex(ids);
    if (isBusinessError(result)) return result;

    const persisted = await this.songQueueRepository.save(songQueue);

    return persisted.requestedSongs;
  }

  public async consumeSong() {
    const songQueue = await this.songQueueRepository.get();
    const song = songQueue.consume();
    if (isBusinessError(song)) return song;

    const [persisted] = await Promise.all([
      await this.songsRepository.save(song),
      await this.songQueueRepository.save(songQueue),
    ]);

    return persisted;
  }

  public async deleteSongByIndex(index: number, isRefund = false) {
    const songQueue = await this.songQueueRepository.get();
    const song = songQueue.deleteSongByIndex(index);
    if (isBusinessError(song)) return song;

    let requestor: SongRequestor | null = null;
    if (isRefund) {
      requestor = await this.songRequestorRepository.getByUsername(song.requestorName);
      if (requestor === null) return new BusinessError('requestor-not-found');

      requestor.refundForSong(song);
    }

    await Promise.all([
      await this.songQueueRepository.save(songQueue),
      requestor && await this.songRequestorRepository.save(requestor),
    ]);

    return song;
  }

  public async resetSongs() {
    const songQueue = await this.songQueueRepository.get();
    songQueue.resetSongs();

    await this.songQueueRepository.save(songQueue);
  }

  public async resetCooltimes() {
    const songQueue = await this.songQueueRepository.get();
    songQueue.resetCooltimes();

    await this.songQueueRepository.save(songQueue);
  }
}
