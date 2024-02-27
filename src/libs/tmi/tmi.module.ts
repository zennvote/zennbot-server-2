import { DynamicModule, Module } from '@nestjs/common';
import { Client, Options } from 'tmi.js';

import { TmiChzzkService } from './tmi-chzzk.service';
import { TmiTwitchService } from './tmi-twitch.service';
import { TMI_CLIENT } from './tmi.types';

@Module({})
export class TmiModule {
  static forRoot(options: Options): DynamicModule {
    const clientFactory = {
      provide: TMI_CLIENT,
      useFactory: async () => {
        const client = new Client(options);

        await client.connect();

        return client;
      },
    };

    return {
      module: TmiModule,
      providers: [clientFactory, TmiTwitchService, TmiChzzkService],
    };
  }
}
