import { CacheModule, Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { ViewersModule } from 'src/viewers/viewers.module';

@Module({
  imports: [CacheModule.register({ ttl: 0 }), ViewersModule],
  providers: [SongsService],
  controllers: [SongsController],
})
export class SongsModule {}
