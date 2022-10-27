/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';

import { idolsFactory } from './idols.factory';

const test = anyTest as TestFn;

test('형식에 맞게 아이돌 정보를 출력할 수 있어야 한다.', async (test) => {
  const idol = await idolsFactory.clearOptional().create({
    firstName: '히구치',
    lastName: '마도카',
    company: '283',
    unit: 'noctchill',
    type: '쿨',
    birthday: '10월 27일',
    age: '17',
    height: '159',
    weight: '47',
    threeSize: '79-55-79',
    hometown: '도쿄',
    cv: '츠지야 리오',
    introduction: '본심을 알다가도 모를 아티스트 아이돌',
  });

  const result = idol.stringified;

  test.is(result, '히구치 마도카 / 283 프로덕션, noctchill 소속, 쿨타입 / 10월 27일생 / 17세 / 159cm, 47kg, 79-55-79 / 도쿄 출신 / CV. 츠지야 리오 / 본심을 알다가도 모를 아티스트 아이돌');
});

test('nullable한 정보를 정상적으로 표기해야 한다.', async (test) => {
  const idol = await idolsFactory.clearOptional().create({
    lastName: '마도카',
    company: '283',
    birthday: '10월 27일',
    age: '17',
    height: '159',
    weight: '47',
    hometown: '도쿄',
    introduction: '본심을 알다가도 모를 아티스트 아이돌',
  });

  const result = idol.stringified;

  test.is(result, '마도카 / 283 프로덕션 / 10월 27일생 / 17세 / 159cm, 47kg / 도쿄 출신 / 본심을 알다가도 모를 아티스트 아이돌');
});

test('비정규 정보를 정상적으로 표기해야 한다.', async (test) => {
  const idol = await idolsFactory.clearOptional().create({
    lastName: '마도카',
    company: '불명',
    birthday: '불명',
    age: '불명',
    height: '불명',
    weight: '불명',
    hometown: '불명',
    introduction: '본심을 알다가도 모를 아티스트 아이돌',
  });

  const result = idol.stringified;

  test.is(result, '마도카 / 소속사 불명 / 생일 불명 / 나이 불명 / 신장 불명, 체중 불명 / 출신지 불명 / 본심을 알다가도 모를 아티스트 아이돌');
});
