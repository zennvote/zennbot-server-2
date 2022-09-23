import { Controller } from '@nestjs/common';
import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';
import { ManagerChatGuard } from 'src/app/managers/guards/manager-chat.guard';
import { isBusinessError } from 'src/util/business-error';
import { AccountsApplication } from './accounts.application';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsApplication: AccountsApplication) {}

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
}
