import { Factory } from 'fishery';

import { Idol, IdolProps } from './idols.entity';

class IdolsFactory extends Factory<IdolProps, Record<string, never>, Idol> {
  clearOptional() {
    return this.params({
      firstName: undefined,
      type: undefined,
      threeSize: undefined,
      cv: undefined,
    });
  }
}

export const idolsFactory = IdolsFactory.define(
  ({ params, sequence, onCreate }) => {
    onCreate((props) => new Idol(props));

    return {
      id: sequence,
      firstName: '아마미',
      lastName: '하루카',
      company: '765',
      type: '프린세스',
      birthday: '4월 3일',
      age: '17',
      height: '158',
      weight: '46',
      threeSize: '83-56-82',
      hometown: '카나가와',
      cv: '나카무라 에리코',
      introduction: '아이돌마스터의 얼굴이자 중심이자 리더인 아이돌',
      ...params,
    };
  },
);
