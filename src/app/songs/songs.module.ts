import { Module } from '@nestjs/common';
import { ViewersModule } from 'src/app/accounts/viewers.module';
import { SettingsModule } from 'src/app/settings/settings.module';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { SongsRepository } from './songs.repository';
import { SongsApplication } from './songs.application';

@Module({
  imports: [ViewersModule, SettingsModule],
  providers: [SongsApplication, SongsService, SongsRepository],
  controllers: [SongsController],
})
export class SongsModule {}
