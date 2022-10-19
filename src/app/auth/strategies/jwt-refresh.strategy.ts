import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { parse } from 'cookie';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwtRefresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request) => parse(request?.headers?.cookie ?? '').RefreshToken]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async validate(req: Request, payload: { username: string; sub: string }) {
    return { id: payload.sub };
  }
}
