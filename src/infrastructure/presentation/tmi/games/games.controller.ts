import { Controller } from '@nestjs/common';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';

import { GamesApplication } from 'src/application/games/games.application';

@Controller('games')
export class GamesController {
  constructor(
    private readonly application: GamesApplication,
  ) {}

  @OnCommand('주사위')
  async rollDice(payload: CommandPayload) {
    const parsedArgs = payload.args.map((arg) => parseInt(arg, 10));
    if (payload.args.length > 2 || parsedArgs.some((arg) => Number.isNaN(arg))) {
      return payload.send('잘못된 명령어 형식입니다. 다시 한번 확인해주세요!');
    }

    // eslint-disable-next-line no-nested-ternary
    const options = parsedArgs.length === 2
      ? { min: parsedArgs[0], max: parsedArgs[1] }
      : parsedArgs.length === 1
        ? { max: parsedArgs[0] }
        : {};

    const result = this.application.rollDice(options);

    payload.send(`주사위 결과는 ${result} 입니다!`);
  }
}
