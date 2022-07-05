import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViewersModule } from './domain/viewers/viewers.module';
import { SongsModule } from './domain/songs/songs.module';
import { TmiModule } from './libs/tmi/tmi.module';
import { ManagerModule } from './domain/managers/managers.module';
import { SheetsModule } from './libs/sheets/sheets.module';
import { UsersModule } from './domain/users/users.module';
import { AuthModule } from './domain/auth/auth.module';

import { getConfigWithConfigService } from '../ormconfig';
import { SettingsModule } from './domain/settings/settings.module';
import { IdolsModule } from './domain/idols/idols.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        VERSION: Joi.string().required(),
        COOKIE_DOMAIN: Joi.string().required(),
        NODE_ENV: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
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
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => getConfigWithConfigService(configService),
      inject: [ConfigService],
    }),
    TmiModule.forRoot({
      identity: {
        username: process.env.TMI_USERNAME,
        password: process.env.TMI_PASSWORD,
      },
      channels: [process.env.TMI_CHANNEL ?? ''],
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
    SettingsModule,
    IdolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
