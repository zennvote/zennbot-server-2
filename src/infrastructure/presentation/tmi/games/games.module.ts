import { Module } from '@nestjs/common';

import { GamesApplication } from 'src/application/games/games.application';

import { GamesController } from './games.controller';

@Module({
  controllers: [GamesController],
  providers: [GamesApplication],
})
export class GamesModule {}
