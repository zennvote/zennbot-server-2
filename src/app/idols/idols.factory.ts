import { Factory } from 'fishery';

import { Idol } from './idols.entity';

class IdolFactory extends Factory<Idol> {
}

export const idolFactory = IdolFactory.define(
  ({ params }) => new Idol({ ...params }),
);

export const getRowFromIdol = (idol: Idol): (string | undefined)[] => [
  idol.firstName,
  idol.lastName,
  idol.company,
  idol.unit,
  idol.type,
  idol.birthday,
  idol.age,
  idol.height,
  idol.weight,
  idol.threeSize,
  idol.hometown,
  idol.cv,
  idol.introduction,
];
