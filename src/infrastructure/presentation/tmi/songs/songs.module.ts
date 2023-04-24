import { Module } from '@nestjs/common';

import { SongsApplication } from 'src/application/songs/songs.application';

import { SongsGateway } from './songs.gateway';

@Module({
  providers: [SongsGateway, SongsApplication],
})
export class SongsModule {}
