import { Controller, Get, Post, Request, Response, UseGuards } from '@nestjs/common';
import { Response as ResponseType } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any, @Response() res: ResponseType) {
    const { access_token, refreshToken } = await this.authService.login(req.user);

    res.cookie('RefreshToken', refreshToken, { httpOnly: true, secure: true });

    return res.json({ access_token });
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Request() req: any, @Response() res: ResponseType) {
    const { access_token } = await this.authService.login(req.user);

    return res.json({ access_token });
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  async validate() {
    return { result: 'got valid token' };
  }
}
