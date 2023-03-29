import { Global, Module } from '@nestjs/common';

import { IdolsRepositoryProvider } from './idols/idols.repository';
import { SettingsRepository } from './settings/settings.repository';
import { SongQueueRepositoryProvider } from './songs/song-queue.repository';
import { SongRequestorRepositoryProvider } from './songs/song-requestor.repository';
import { SongsRepositoryProvider } from './songs/songs.repository';
import { ViewersRepositoryProvider } from './viewers/viewers.repository';

const Repositories = [
  IdolsRepositoryProvider,

  SettingsRepository,

  SongsRepositoryProvider,
  SongQueueRepositoryProvider,
  SongRequestorRepositoryProvider,

  ViewersRepositoryProvider,
];

@Global()
@Module({
  exports: Repositories,
  providers: Repositories,
})
export class RepositoryModule {}
