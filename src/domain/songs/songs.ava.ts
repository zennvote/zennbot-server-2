/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';

import { isBusinessError } from 'src/util/business-error';

import { songFactory } from './songs.factory';

const test = anyTest as TestFn;

test('신청곡을 넘길 수 있어야 한다.', async (test) => {
  const song = await songFactory.create();

  const result = song.consume();

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.is(song.consumed, true);
});

test('이미 넘긴 신청곡을 넘길 시 실패해야 한다.', async (test) => {
  const song = await songFactory.create({ consumed: true });

  const result = song.consume();

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'already-consumed');
});
