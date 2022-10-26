import { Controller } from '@nestjs/common';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';

import { isBusinessError } from 'src/util/business-error';

import { AccountsApplication } from 'src/application/accounts/accounts.application';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly application: AccountsApplication,
  ) {}

  @OnCommand('조각')
  async getAccountProfile(payload: CommandPayload) {
    const twitchId = payload.tags.username;
    const username = payload.tags['display-name'];
    if (!twitchId || !username) return;

    const result = await this.application.queryAccountProfile(twitchId, username);
    if (isBusinessError(result)) {
      switch (result.error) {
        case 'no-viewer':
        case 'no-account':
          return payload.send(`${username}님의 데이터가 존재하지 않습니다!`);
      }
    }

    const { ticket, ticketPiece, prefix } = result.account;
    const formattedPrefix = prefix ? `[${prefix}] ` : '';

    payload.send(`${formattedPrefix}${result.account.username} 티켓 ${ticket}장 | 조각 ${ticketPiece}장 보유중`);
  }
}
