import { Controller, Delete, Get, Param, Post, Sse, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { map } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { CommandPayload } from 'src/tmi/tmi.interface';
import { ViewersService } from 'src/viewers/viewers.service';
import { RequestType } from './songs.entity';

import { SongsService } from './songs.service';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService, private readonly viewersService: ViewersService) {}

  @Get()
  async getSongs() {
    return await this.songsService.getRequestedSongs();
  }

  @UseGuards(JwtAuthGuard)
  @Post('skip')
  async skipSong() {
    return await this.songsService.skipSong();
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetSongs() {
    await this.songsService.resetRequestedSongs();
    await this.songsService.resetCooltimeSongs();
  }

  @Get('cooltimes')
  async getCooltimeSongs() {
    return await this.songsService.getCooltimeSongs();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cooltimes')
  async deleteCooltimeSongs() {
    return await this.songsService.resetCooltimeSongs();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':title')
  async createSong(@Param('title') title: string) {
    return await this.songsService.enqueueSong({
      requestor: 'producerzenn',
      requestorName: '프로듀서_젠',
      requestType: RequestType.manual,
      title,
    });
  }

  @Sse('sse')
  getSongsSse() {
    return this.songsService.requestedSongsObserver.pipe(map((data) => JSON.stringify(data)));
  }

  @OnEvent('command.신청')
  async requestSongCommand(payload: CommandPayload) {
    if (payload.args.length <= 0) {
      return payload.send('곡명을 입력해주세요!');
    }

    const title = payload.args.join(' ');
    const twitchId = payload.tags['username'];
    const username = payload.tags['display-name'];

    const viewer = await this.viewersService.getViewer(twitchId, username);
    if (!viewer) {
      return payload.send('존재하지 않는 사용자입니다! 신규 등록을 요청해주세요');
    }

    const isCooltime = await this.songsService.isCooltime(twitchId);
    if (isCooltime) {
      return payload.send('아직 곡을 신청할 수 없어요! 이전에 신청한 곡 이후로 최소 4개의 곡이 신청되어야 해요.');
    }

    const { ticket, ticketPiece } = viewer;

    if (ticket > 0) {
      this.viewersService.setPoints(twitchId, username, { ticket: ticket - 1 });
    } else if (ticketPiece > 2) {
      this.viewersService.setPoints(twitchId, username, { ticketPiece: ticketPiece - 3 });
    } else {
      return payload.send('포인트가 부족해요! !젠 조각 명령어로 보유 포인트를 확인해주세요~');
    }

    const requestType = ticket > 0 ? RequestType.ticket : RequestType.ticketPiece;
    await this.songsService.enqueueSong({ title, requestType, requestor: twitchId, requestorName: username });

    // eslint-disable-next-line prettier/prettier
    payload.send(`${username}님의 ${requestType} ${requestType === RequestType.ticket ? '1장을' : '3개를'} 사용하여 곡을 신청했어요!`)
  }
}
