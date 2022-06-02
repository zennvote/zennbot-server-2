import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { parse } from 'cookie';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwtRefresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request) => parse(request?.headers?.cookie ?? '').RefreshToken]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(req: Request, payload: { username: string; sub: string }) {
    return { id: payload.sub };
  }
}
