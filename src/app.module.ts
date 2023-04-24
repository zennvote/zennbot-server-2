import {
  CacheModule, MiddlewareConsumer, Module, NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TmiModule } from '@tmi-nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViewersModule } from './app/accounts/viewers.module';
import { AttendancesModule } from './app/attendances/attendances.module';
import { AuthModule } from './app/auth/auth.module';
import { GameModule } from './app/game/game.module';
import { IdolsModule } from './app/idols/idols.module';
import { ManagerModule } from './app/managers/managers.module';
import { SettingsModule } from './app/settings/settings.module';
import { SongsModule } from './app/songs/songs.module';
import { UsersModule } from './app/users/users.module';
import { RepositoryModule } from './infrastructure/persistence/repository.module';
import { HttpControllerModules } from './infrastructure/presentation/http/http.controller';
import { TmiControllerModules } from './infrastructure/presentation/tmi/tmi.controller';
import { PrismaModule } from './libs/prisma/prisma.module';
import { SheetsModule } from './libs/sheets/sheets.module';
import { TmiModule as LegacyTmiModule } from './libs/tmi/tmi.module';
import { HttpLoggerMiddleware } from './util/http-logger-middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        VERSION: Joi.string().required(),
        COOKIE_DOMAIN: Joi.string().required(),
        NODE_ENV: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        SHEETS_CREDENTIALS_PATH: Joi.string(),
        SHEETS_CREDENTIALS: Joi.string(),
        SHEETS_TOKEN_PATH: Joi.string(),
        SHEETS_TOKEN: Joi.string(),
        SHEETS_ID: Joi.string().required(),
        IDOL_SHEETS_ID: Joi.string().required(),
        TMI_CHANNEL: Joi.string().required(),
        TMI_PASSWORD: Joi.string().required(),
        TMI_USERNAME: Joi.string().required(),
      }),
    }),
    TmiModule.forRoot({
      identity: {
        username: process.env.TMI_USERNAME,
        password: process.env.TMI_PASSWORD,
      },
      channels: [process.env.TMI_CHANNEL ?? ''],
    }),
    LegacyTmiModule.forRoot({
      identity: {
        username: process.env.TMI_USERNAME,
        password: process.env.TMI_PASSWORD,
      },
      channels: [process.env.TMI_CHANNEL ?? ''],
    }),
    CacheModule.register(
      process.env.NODE_ENV === 'test' ? {
        isGlobal: true,
        ttl: 0,
      } : {
        store: redisStore,
        url: process.env.REDIS_URL,
        isGlobal: true,
        ttl: 0,
      },
    ),
    EventEmitterModule.forRoot(),
    ViewersModule,
    SongsModule,
    ManagerModule.forRoot(),
    SheetsModule.forRoot({
      credentialsPath: process.env.SHEETS_CREDENTIALS_PATH,
      tokenPath: process.env.SHEETS_TOKEN_PATH,
      credentials: process.env.SHEETS_CREDENTIALS,
      token: process.env.SHEETS_TOKEN,
    }),
    UsersModule,
    AuthModule,
    SettingsModule,
    IdolsModule,
    AttendancesModule,
    GameModule,
    PrismaModule,
    RepositoryModule,
    ...HttpControllerModules,
    ...TmiControllerModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // eslint-disable-next-line class-methods-use-this
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
