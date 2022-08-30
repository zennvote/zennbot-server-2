import { User } from 'src/app/users/entities/user.entity';
import * as jwt from 'jsonwebtoken';

export const getAuthorizeToken = (user: User): ['Authorization', string] => {
  if (process.env.JWT_SECRET === undefined) {
    return ['Authorization', ''];
  }

  const payload = { username: user.username, sub: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1D' });

  return ['Authorization', `Bearer ${token}`];
};
