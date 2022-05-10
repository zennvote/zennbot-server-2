import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from 'src/users/users.module';
import { UserDataModel } from 'src/users/entities/user.datamodel';

import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserDataModel]), UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
