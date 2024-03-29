import {
  Controller, Get, Post, Request, Response, UseGuards,
} from '@nestjs/common';
import { Response as ResponseType } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any, @Response() res: ResponseType) {
    const { access_token: accessToken, refreshToken } = await this.authService.login(req.user);

    res.cookie('RefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN,
    });

    return res.json({ access_token: accessToken });
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Request() req: any, @Response() res: ResponseType) {
    const { access_token: accessToken } = await this.authService.login(req.user);

    return res.json({ access_token: accessToken });
  }

  // eslint-disable-next-line class-methods-use-this
  @UseGuards(JwtAuthGuard)
  @Get('validate')
  async validate() {
    return { result: 'got valid token' };
  }
}
