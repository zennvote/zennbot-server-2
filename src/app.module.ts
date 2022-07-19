import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViewersModule } from './app/viewers/viewers.module';
import { SongsModule } from './app/songs/songs.module';
import { TmiModule } from './libs/tmi/tmi.module';
import { ManagerModule } from './app/managers/managers.module';
import { SheetsModule } from './libs/sheets/sheets.module';
import { UsersModule } from './app/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { SettingsModule } from './app/settings/settings.module';
import { IdolsModule } from './app/idols/idols.module';
import { AttendancesModule } from './app/attendances/attendances.module';
import { PrismaModule } from './libs/prisma/prisma.module';

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
    AttendancesModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
