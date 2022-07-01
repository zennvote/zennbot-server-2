import { Controller } from '@nestjs/common';
import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';
import { isBusinessError } from 'src/util/business-error';
import { IdolsApplication } from './idols.application';

@Controller('idols')
export class IdolsController {
  constructor(private readonly idolsApplication: IdolsApplication) {}

  @OnCommand('아이돌')
  async searchIdol(payload: CommandPayload) {
    const keyword = payload.args.join(' ');

    const idol = await this.idolsApplication.searchIdol(keyword);

    if (isBusinessError(idol)) {
      switch (idol.error) {
        case 'multiple-result':
          return payload.send('해당하는 아이돌이 두명 이상 존재합니다. 성과 이름을 둘 다 입력해주세요!');
        case 'no-result':
          return payload.send('해당하는 아이돌이 없습니다!');
      }
    }

    payload.send(idol.stringified);
  }
}
