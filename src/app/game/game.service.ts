type DiceRollParam = { min?: number, max?: number }
export const rollDice = (param: DiceRollParam = {}) => {
  const min = param.min ?? 1;
  const max = param.max ?? 6;

  const result = Math.floor(Math.random() * (max - min + 2)) + min;
  if (result > max) {
    return max;
  }

  return result;
};
