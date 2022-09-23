import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';
import { thrower } from 'src/util/throw';
import { isBusinessError } from 'src/util/business-error';

import { ManagerChatGuard } from 'src/app/managers/guards/manager-chat.guard';

import { AccountsApplication } from './accounts.application';
import { CreateAccountDto } from './dto/create-account.dto';
import { FindAccountQuery, FindAccountResult } from './queries/find-account.query';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsApplication: AccountsApplication,
    private readonly queryBus: QueryBus,
  ) {}

  @ManagerChatGuard()
  @OnCommand('시청자등록')
  async registerViewer(payload: CommandPayload) {
    const [username, twitchId] = payload.args;

    if (payload.args.length < 1) {
      return payload.send('시청자 이름을 입력해주세요!');
    }

    const request = new CreateAccountDto(username, twitchId);
    const result = await this.accountsApplication.createAccount(request);

    if (isBusinessError(result)) {
      switch (result.error) {
      case 'already-exists':
        return payload.send(`${username}님이 이미 존재합니다!`);
      }
    }

    return payload.send(`새로운 시청자 ${username}님이 등록되었습니다!`);
  }

  @OnCommand('조각')
  async whoAmICommand(payload: CommandPayload) {
    const twitchId = payload.tags.username ?? thrower(new Error('no username in payload'));
    const username = payload.tags['display-name'] ?? thrower(new Error('no display-name in payload'));

    const query = new FindAccountQuery(username, twitchId);
    const result = await this.queryBus.execute<FindAccountQuery, FindAccountResult>(query);

    if (isBusinessError(result)) {
      return payload.send(`${username}님의 데이터가 존재하지 않습니다!`);
    }

    const { ticket, ticketPiece, prefix } = result;
    const formattedPrefix = prefix ? `[${prefix}] ` : '';

    payload.send(`${formattedPrefix}${username} 티켓 ${ticket}장 | 조각 ${ticketPiece}장 보유중`);
  }
}
