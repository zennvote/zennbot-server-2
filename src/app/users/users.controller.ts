import {
  Body, Controller, ForbiddenException, Post,
} from '@nestjs/common';

import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    throw new ForbiddenException('Creating New User is currently disabled');
    // return this.usersService.create(body.username, body.password);
  }
}
