import { Controller } from '@nestjs/common';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';

import { isBusinessError } from 'src/util/business-error';

import { ViewersApplication } from 'src/application/viewers/viewers.application';

@Controller('viewers')
export class ViewersController {
  constructor(
    private readonly application: ViewersApplication,
  ) { }

  @OnCommand('조각')
  async getAccountProfile(payload: CommandPayload) {
    const twitchId = payload.tags.username;
    const username = payload.tags['display-name'];
    if (!twitchId || !username) return;

    const result = await this.application.queryViewer(twitchId, username);
    if (isBusinessError(result)) {
      switch (result.error) {
        case 'no-viewer':
          return payload.send(`${username}님의 데이터가 존재하지 않습니다!`);
      }
    }

    const { ticket, ticketPiece, prefix } = result;
    const formattedPrefix = prefix ? `[${prefix}] ` : '';

    payload.send(`${formattedPrefix}${result.username} 티켓 ${ticket}장 | 조각 ${ticketPiece}장 보유중`);
  }

  @OnCommand('트위치')
  async migrateFromTwitchToChzzk(payload: CommandPayload) {
    const chzzkId = payload.tags['user-id'];
    const chzzkUsername = payload.tags.username;
    const twitchUsername = payload.args[0];

    if (!chzzkId) return payload.send('치지직 아이디 조회에 실패했어요!');
    if (!chzzkUsername) return payload.send('치지직 닉네임 조회에 실패했어요!');

    const result = await this.application.requestMigrationToChzzk(twitchUsername, chzzkId, chzzkUsername);
    if (isBusinessError(result)) {
      switch (result.error) {
        case 'no-viewer':
          return payload.send('시트에 존재하지 않는 트위치 계정입니다!');
        case 'already-migrated':
          return payload.send('이미 치지직 계정으로 마이그레이션된 계정입니다!');
      }
    }

    return payload.send('치지직 계정으로 마이그레이션 신청이 완료되었습니다!');
  }
}
