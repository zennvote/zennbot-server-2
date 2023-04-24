import { Injectable } from '@nestjs/common';
import { Command, Message, Userstate } from '@tmi-nestjs/core';

import { isBusinessError, mapError } from 'src/util/business-error';

import { SongsApplication } from 'src/application/songs/songs.application';

import { RequestType } from 'src/domain/songs/entities/songs.entity';

@Injectable()
export class SongsGateway {
  constructor(
    private readonly songsApplication: SongsApplication,
  ) {}

  @Command({ name: '!신청' })
  async requestSong(
    @Message() title: string,
    @Userstate('username') twitchId: string,
    @Userstate('display-name') username: string,
  ) {
    if (title.length === 0) return '곡명을 입력해주세요!';

    const result = await this.songsApplication.requestSong(twitchId, username, title);

    if (isBusinessError(result)) {
      return mapError(result, {
        'in-cooltime': '아직 곡을 신청할 수 없어요! 이전에 신청한 곡 이후로 최소 4개의 곡이 신청되어야 해요.',
        'not-enough-point': '포인트가 부족해요! "!젠 조각" 명령어로 보유 포인트를 확인해주세요',
        'request-disabled': '현재 신청곡을 받고있지 않아요!',
        'requestor-not-found': '시청자 정보가 없어요! 신규 등록을 요청해주세요~',
      });
    }

    if (result.requestType === RequestType.freemode) {
      return `🔔 골든벨🔔 ${username}님의 곡이 무료로 신청되었어요!`;
    }

    const paymentsString = (
      result.requestType === RequestType.ticket ? '티켓 1장' : '조각 3개'
    );
    return `${username}님의 ${paymentsString}를 사용해 곡을 신청했어요!`;
  }
}
