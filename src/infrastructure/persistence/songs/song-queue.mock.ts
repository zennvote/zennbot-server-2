import { SinonSandbox } from 'sinon';

import { SongQueue } from 'src/domain/songs/entities/song-queue.entity';
import { SongQueueRepository } from 'src/domain/songs/repositories/song-queue.repository';
import { songQueueFactory } from 'src/domain/songs/songs.factory';

export class MockSongQueueRepository implements SongQueueRepository {
  constructor(public readonly sinon: SinonSandbox) {}

  public get = this.sinon.fake(async () => songQueueFactory.create());
  public save = this.sinon.fake(async (songQueue: SongQueue) => songQueue);
}
