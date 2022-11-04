import { Controller } from '@nestjs/common';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';

import { isBusinessError } from 'src/util/business-error';

import { IdolsApplication } from 'src/application/idols/idols.application';

@Controller('idols')
export class IdolsController {
  constructor(
    private readonly application: IdolsApplication,
  ) {}

  @OnCommand('담당p')
  async getAccountProfile(payload: CommandPayload) {
    const keyword = payload.args.join(' ');

    const result = await this.application.queryBiasProducer(keyword);
    if (isBusinessError(result)) {
      switch (result.error) {
        case 'multiple-idol':
          return payload.send('해당하는 아이돌이 두명 이상 존재합니다. 성과 이름을 둘 다 입력해주세요!');
        case 'no-idol':
          return payload.send('해당하는 아이돌이 없습니다!');
      }
    }

    const { idol, viewers } = result;
    if (viewers.length === 0) return payload.send(`${idol.fullName}의 담당 프로듀서가 없습니다!`);

    payload.send(`${idol.fullName}의 담당 프로듀서는 ${viewers.map((viewer) => viewer.username).join(', ')} 입니다!`);
  }
}
