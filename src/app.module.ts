import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) ?? 5433,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [],
      synchronize: true,
      autoLoadEntities: true,
      keepConnectionAlive: true,
      logging: true,
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
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
