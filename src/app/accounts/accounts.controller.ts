import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';
import { thrower } from 'src/util/throw';
import { isBusinessError } from 'src/util/business-error';

import { ManagerChatGuard } from 'src/app/managers/guards/manager-chat.guard';

import { BalanceType } from 'src/domain/accounts/accounts.entity';
import { AccountsApplication } from './accounts.application';
import { CreateAccountDto } from './dto/create-account.dto';
import { FindAccountQuery, FindAccountResult } from './queries/find-account.query';
import { DepositePointCommand } from './commands/deposite-point.command';
import { DepositePointDto } from './dto/deposite-point.dto';
import { DepositePointResult } from './commands/deposite-point.handler';
import { WithdrawPointCommand } from './commands/withdraw-point.command';
import { WithdrawPointDto } from './dto/withdraw-point.dto';
import { WithdrawPointResult } from './commands/withdraw-point.handler';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsApplication: AccountsApplication,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
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

  @ManagerChatGuard()
  @OnCommand('지급')
  async depositeCommand(payload: CommandPayload) {
    const [inputType, name, inputPoint] = payload.args;

    if (payload.args.length < 2 || Number.isNaN(inputType) || (inputType !== '곡' && inputType !== '조각')) {
      return payload.send('잘못된 명령어 형식입니다. 다시 한번 확인해주세요!');
    }

    const type = inputType === '곡' ? BalanceType.Ticket : BalanceType.TicketPiece;
    const amount = parseInt(inputPoint, 10) || 1;

    const isDeposite = amount > 0;

    let command: DepositePointCommand | WithdrawPointCommand;
    let result: DepositePointResult | WithdrawPointResult;

    if (isDeposite) {
      command = new DepositePointCommand(new DepositePointDto(name, type, amount));
      result = await this.commandBus.execute<DepositePointCommand, DepositePointResult>(command);
    } else {
      command = new WithdrawPointCommand(new WithdrawPointDto(name, type, amount));
      result = await this.commandBus.execute<WithdrawPointCommand, WithdrawPointResult>(command);
    }

    if (isBusinessError(result)) {
      if (result.error === 'not-found') {
        return payload.send('존재하지 않는 시청자입니다.');
      }
    }

    if (isDeposite) {
      payload.send(`${name}님에게 ${inputType} ${amount}개를 지급하였습니다.`);
    } else {
      payload.send(`${name}님의 ${inputType} ${-amount}개를 차감하였습니다.`);
    }
  }
}
