import { Module } from '@nestjs/common';

import { GameApplication } from './game.application';
import { GameController } from './game.controller';

@Module({
  providers: [GameApplication],
  controllers: [GameController],
})
export class GameModule {}
