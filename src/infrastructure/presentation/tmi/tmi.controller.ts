import { GamesModule } from './games/games.module';
import { IdolsModule } from './idols/idols.module';
import { ViewersModule } from './viewers/viewers.module';

export const TmiControllerModules = [
  ViewersModule,
  IdolsModule,
  GamesModule,
];
