import { SinonSandbox } from 'sinon';
import { Song } from 'src/domain/songs/songs.entity';
import { SongsRepository } from 'src/domain/songs/songs.repository';

export class MockSongsRepository implements SongsRepository {
  constructor(public readonly sinon: SinonSandbox) {}

  public save = this.sinon.fake(async (song: Song) => song);
  public getRequestedSongs = this.sinon.fake.resolves([]);
  public getCooltimeSongs = this.sinon.fake.resolves([]);
}
