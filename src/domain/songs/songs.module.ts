import { CacheModule, Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { ViewersModule } from 'src/domain/viewers/viewers.module';
import { SongsRepository } from './songs.repository';
import { SongsApplication } from './songs.application';
import { SettingsModule } from 'src/domain/settings/settings.module';

@Module({
  imports: [CacheModule.register({ ttl: 0 }), ViewersModule, SettingsModule],
  providers: [SongsApplication, SongsService, SongsRepository],
  controllers: [SongsController],
})
export class SongsModule {}
