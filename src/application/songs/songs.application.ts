import { Inject, Injectable } from '@nestjs/common';

import { BusinessError, isBusinessError } from 'src/util/business-error';

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

  public async requestSong(twitchId: string, username: string, title: string) {
    const songQueue = await this.songQueueRepository.get();
    const requestor = await this.songRequestorRepository.get(twitchId, username);
    if (requestor === null) return new BusinessError('requestor-not-found');

    const song = songQueue.request(title, twitchId, requestor);
    if (isBusinessError(song)) return song;

    const [persisted] = await Promise.all([
      await this.songsRepository.save(song),
      await this.songQueueRepository.save(songQueue),
      await this.songRequestorRepository.save(requestor),
    ]);

    return persisted;
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

  public async getQueue() {
    return this.songQueueRepository.get();
  }
}
