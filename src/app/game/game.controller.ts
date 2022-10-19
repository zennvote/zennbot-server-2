import { Controller } from '@nestjs/common';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';

import { RollDiceDto } from './dtos/roll-dice.dto';
import { GameApplication } from './game.application';

@Controller('game')
export class GameController {
  constructor(private readonly gameApplication: GameApplication) {}

  @OnCommand('주사위')
  async rollDice(payload: CommandPayload) {
    const parsedArgs = payload.args.map((arg) => parseInt(arg, 10));
    if (payload.args.length > 2 || parsedArgs.some((arg) => Number.isNaN(arg))) {
      return payload.send('잘못된 명령어 형식입니다. 다시 한번 확인해주세요!');
    }

    const dto = new RollDiceDto();
    if (parsedArgs.length === 2) {
      const [min, max] = parsedArgs;
      dto.min = min;
      dto.max = max;
    } else if (parsedArgs.length === 1) {
      const [max] = parsedArgs;
      dto.max = max;
    }

    const result = await this.gameApplication.rollDice(dto);

    payload.send(`주사위 결과는 ${result} 입니다!`);
  }
}
