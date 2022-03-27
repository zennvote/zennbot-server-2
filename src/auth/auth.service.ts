import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

const saltRounds = 11;

@Injectable()
export class AuthService {
  constructor(private usersSservice: UsersService) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersSservice.findOne(username);
    const hashed = await this.getHashedPassword(password);

    if (!user || user.password !== hashed) {
      return null;
    }
    const { password: _, ...result } = user;

    return result;
  }

  private async getHashedPassword(password: string) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed = await bcrypt.hash(password, salt);

    return hashed;
  }
}
