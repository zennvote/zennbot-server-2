import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-local';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwtRefresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request) => request.cookies.RefreshToken]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: { username: string; sub: string }) {
    return { id: payload.sub };
  }
}
