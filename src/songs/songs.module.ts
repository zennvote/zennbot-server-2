import { CacheModule, Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { ViewersModule } from 'src/viewers/viewers.module';
import { SongsRepository } from './songs.repository';
import { SongsApplication } from './songs.application';

@Module({
  imports: [CacheModule.register({ ttl: 0 }), ViewersModule],
  providers: [SongsApplication, SongsService, SongsRepository],
  controllers: [SongsController],
})
export class SongsModule {}
