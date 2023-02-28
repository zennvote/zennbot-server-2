import { SinonSandbox } from 'sinon';

import { SongRequestor } from 'src/domain/songs/entities/song-requestor.entity';
import { SongRequestorRepository } from 'src/domain/songs/repositories/song-requestor.repository';
import { songRequestorFactory } from 'src/domain/songs/songs.factory';

export class MockSongRequestorRepository implements SongRequestorRepository {
  constructor(public readonly sinon: SinonSandbox) {}

  public get = this.sinon.fake(async (twitchId: string, username: string) => (
    songRequestorFactory.create({ twitchId, username })
  ));

  public save = this.sinon.fake(async (songRequestor: SongRequestor) => songRequestor);
}
