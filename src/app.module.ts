import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViewersModule } from './viewers/viewers.module';
import { SongsModule } from './songs/songs.module';
import { TmiModule } from './tmi/tmi.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ManagerModule } from './managers/managers.module';
import { SheetsModule } from './sheets/sheets.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { getConfigWithConfigService } from '../ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => getConfigWithConfigService(configService),
      inject: [ConfigService],
    }),
    TmiModule.forRoot({
      identity: {
        username: process.env.TMI_USERNAME,
        password: process.env.TMI_PASSWORD,
      },
      channels: [process.env.TMI_CHANNEL],
    }),
    EventEmitterModule.forRoot(),
    ViewersModule,
    SongsModule,
    ManagerModule,
    SheetsModule.forRoot({
      credentialsPath: process.env.SHEETS_CREDENTIALS_PATH,
      tokenPath: process.env.SHEETS_TOKEN_PATH,
      credentials: process.env.SHEETS_CREDENTIALS,
      token: process.env.SHEETS_TOKEN,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
