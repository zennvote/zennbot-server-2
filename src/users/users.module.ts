import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDataModel } from './entities/user.datamodel';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserDataModel])],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
