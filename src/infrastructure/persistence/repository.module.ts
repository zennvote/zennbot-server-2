import { Global, Module } from '@nestjs/common';

import { AccountsRepository } from './accounts/accounts.repository';
import { IdolsRepository } from './idols/idols.repository';
import { SettingsRepository } from './settings/settings.repository';
import { SongsRepository } from './songs/songs.repository';
import { ViewersRepository } from './viewers/viewers.repository';

const Repositories = [
  AccountsRepository,
  SettingsRepository,
  SongsRepository,
  ViewersRepository,
  IdolsRepository,
];

@Global()
@Module({
  exports: Repositories,
  providers: Repositories,
})
export class RepositoryModule {}
