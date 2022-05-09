import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from 'src/users/users.module';
import { UserDataModel } from 'src/users/entities/user.datamodel';

import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDataModel]),
    JwtModule.register({ secret: 'process.env.JWT_SECRET', signOptions: { expiresIn: '60m' } }),
    UsersModule,
    PassportModule,
  ],
  providers: [AuthService, LocalStrategy, AuthRepository, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
