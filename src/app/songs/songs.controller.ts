import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { map } from 'rxjs';

import { JwtAuthGuard } from 'src/app/auth/guards/jwt-auth.guard';
import { isBusinessError } from 'src/util/business-error';
import { CommandPayload } from 'src/libs/tmi/tmi.types';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import Song, { RequestType } from './songs.entity';
import { SongsApplication } from './songs.application';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsApplication: SongsApplication) { }

  @Get()
  @ApiOkResponse({ type: [Song] })
  async getSongs() {
    return this.songsApplication.getSongs();
  }

  @Sse('sse')
  @ApiOkResponse({ type: [Song] })
  getSongsSse() {
    return this.songsApplication.getSongsObserver().pipe(map((data) => JSON.stringify(data)));
  }

  @Sse('cooltimes/sse')
  @ApiOkResponse({ type: [Song] })
  getCooltimeSongsSse() {
    return this.songsApplication
      .getCooltimeSongsObserver()
      .pipe(map((data) => JSON.stringify(data)));
  }

  @OnCommand('신청')
  async requestSongCommand(payload: CommandPayload) {
    if (payload.args.length <= 0) {
      return payload.send('곡명을 입력해주세요!');
    }

    const title = payload.args.join(' ');
    const twitchId = payload.tags.username;
    const username = payload.tags['display-name'];

    if (!twitchId || !username) {
      return;
    }

    const result = await this.songsApplication.requestSong(title, twitchId, username);
    if (isBusinessError(result)) {
      switch (result.error) {
        case 'request-disabled':
          return payload.send('현재 신청곡을 받고있지 않습니다!');
        case 'viewer-not-exists':
          return payload.send('존재하지 않는 사용자입니다! 신규 등록을 요청해주세요');
        case 'in-cooltime':
          return payload.send('아직 곡을 신청할 수 없어요! 이전에 신청한 곡 이후로 최소 4개의 곡이 신청되어야 해요.');
        case 'no-points':
          return payload.send('포인트가 부족해요! !젠 조각 명령어로 보유 포인트를 확인해주세요~');
        default:
          return;
      }
    }

    const { requestType } = result;
    if (requestType === RequestType.freemode) {
      return payload.send(`🔔 골든벨🔔 ${username}님의 곡이 무료로 신청되었어요!`);
    }

    const usedPointsString = requestType === RequestType.ticket ? '1장을' : '3개를';

    return payload.send(`${username}님의 ${requestType} ${usedPointsString} 사용하여 곡을 신청했어요!`);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiCreatedResponse({ type: Song })
  async createSong(@Body('title') title: string) {
    return this.songsApplication.createSongManually(title);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cooltimes')
  async deleteCooltimeSongs() {
    return this.songsApplication.resetCooltimeSongs();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':index')
  async deleteSong(@Param('index') indexStr: string, @Query('refund') refundStr: string) {
    const isRefund = refundStr !== undefined;
    const index = parseInt(indexStr, 10);

    if (Number.isNaN(index) || index < 0) {
      throw new BadRequestException();
    }

    const result = await this.songsApplication.deleteSong(index, isRefund);
    if (isBusinessError(result)) {
      switch (result.error) {
        case 'viewer-not-exists':
          throw new NotFoundException();
        case 'out-of-range':
          throw new BadRequestException();
        default:
          throw new InternalServerErrorException();
      }
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('skip')
  @ApiOkResponse({ type: Song })
  async skipSong() {
    const result = await this.songsApplication.skipSong();
    if (isBusinessError(result)) {
      throw new BadRequestException();
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reindex')
  @ApiOkResponse({ type: [Song] })
  async reindexSongs(@Body() indexes: number[]) {
    const result = await this.songsApplication.reindexSongs(indexes);

    if (isBusinessError(result)) {
      throw new BadRequestException();
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  @ApiOkResponse()
  async resetSongs() {
    return this.songsApplication.resetRequestedSongs();
  }

  @Get('cooltimes')
  @ApiOkResponse({ type: [Song] })
  async getCooltimeSongs() {
    return this.songsApplication.getCooltimeSongs();
  }
}
