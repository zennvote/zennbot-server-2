/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common';
import { RollDiceDto } from './dtos/roll-dice.dto';
import { rollDice } from './game.service';

@Injectable()
export class GameApplication {
  async rollDice(dto: RollDiceDto) {
    const result = rollDice(dto);

    return result;
  }
}
