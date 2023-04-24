import { Injectable } from '@nestjs/common';
import { Command, Userstate } from '@tmi-nestjs/core';

import { isBusinessError, mapError } from 'src/util/business-error';

import { ViewersApplication } from 'src/application/viewers/viewers.application';

@Injectable()
export class ViewersController {
  constructor(private readonly application: ViewersApplication) {}

  @Command({ name: '!조각' })
  async getAccountProfile(
    @Userstate('username') twitchId: string,
    @Userstate('display-name') username: string,
  ) {
    const result = await this.application.queryViewer(twitchId, username);

    if (isBusinessError(result)) {
      return mapError(result, {
        'no-viewer': `${username}님의 데이터가 존재하지 않습니다!`,
      });
    }

    const { ticket, ticketPiece, prefix } = result;
    const formattedPrefix = prefix ? `[${prefix}] ` : '';

    return `${formattedPrefix}${result.username} 티켓 ${ticket}장 | 조각 ${ticketPiece}장 보유중`;
  }
}
