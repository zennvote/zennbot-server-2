import { SongQueue } from '../entities/song-queue.entity';

export const SONG_QUEUE_REPOSITORY = 'SONG_QUEUE_REPOSITORY';

export interface SongQueueRepository {
  get(): Promise<SongQueue>;
  save(songQueue: SongQueue): Promise<SongQueue>;
}
