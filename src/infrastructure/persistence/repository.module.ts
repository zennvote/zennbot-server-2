import { Global, Module } from '@nestjs/common';

import { IdolsRepository } from './idols/idols.repository';
import { SettingsRepository } from './settings/settings.repository';
import { SongQueueRepositoryProvider } from './songs/song-queue.repository';
import { SongRequestorRepositoryProvider } from './songs/song-requestor.repository';
import { SongsRepositoryProvider } from './songs/songs.repository';
import { ViewersRepository } from './viewers/viewers.repository';

const Repositories = [
  IdolsRepository,

  SettingsRepository,

  SongsRepositoryProvider,
  SongQueueRepositoryProvider,
  SongRequestorRepositoryProvider,

  ViewersRepository,
];

@Global()
@Module({
  exports: Repositories,
  providers: Repositories,
})
export class RepositoryModule {}
