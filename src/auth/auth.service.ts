import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(private authRepository: AuthRepository, private usersService: UsersService) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOne(username);

    const result = await this.authRepository.checkPassword(user, password);

    return result;
  }
}
