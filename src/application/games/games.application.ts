import { Injectable } from '@nestjs/common';

@Injectable()
export class GamesApplication {
  public rollDice(options: { min?: number, max?: number } = {}) {
    const min = options.min ?? 1;
    const max = options.max ?? 6;

    const result = Math.floor(Math.random() * (max - min + 2)) + min;
    if (result > max) return max;

    return result;
  }
}
