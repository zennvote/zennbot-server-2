import { SinonSandbox } from 'sinon';

import { Song } from 'src/domain/songs/entities/songs.entity';
import { SongsRepository } from 'src/domain/songs/repositories/songs.repository';

export class MockSongsRepository implements SongsRepository {
  constructor(public readonly sinon: SinonSandbox) {}

  public save = this.sinon.fake(async (song: Song) => song);
}
