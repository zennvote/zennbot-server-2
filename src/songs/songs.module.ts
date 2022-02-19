import { CacheModule, Module } from '@nestjs/common';
import { SongsService } from './songs.service';

@Module({
  imports: [CacheModule.register()],
  providers: [SongsService],
})
export class SongsModule {}
