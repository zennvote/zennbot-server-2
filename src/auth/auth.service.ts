import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOne(username);

    const result = await this.authRepository.checkPassword(user, password);

    return result;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    const refreshPayload = { sub: user.id };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      refresh_token: this.jwtService.sign(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }),
    };
  }
}
