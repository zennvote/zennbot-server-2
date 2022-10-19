/* eslint-disable no-param-reassign */

import anyTest, { TestFn } from 'ava';

import { isBusinessError } from 'src/util/business-error';

import { accountsFactory } from './accounts.factory';

const test = anyTest as TestFn;

test('신청곡 신청 시 티켓 1개를 소비한다.', async (test) => {
  const account = await accountsFactory.create({ ticket: 3 });

  const result = account.payForRequestSong();

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.is(result, 'ticket');
  test.is(account.ticket, 2);
});

test('신청곡 신청 시 조각 3개를 소비한다.', async (test) => {
  const account = await accountsFactory.create({ ticketPiece: 12 });

  const result = account.payForRequestSong();

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.is(result, 'ticketPiece');
  test.is(account.ticketPiece, 9);
});

test('신청곡 신청 시 두 종류의 포인트를 모두 보유한 경우 티켓을 소비한다.', async (test) => {
  const account = await accountsFactory.create({ ticket: 3, ticketPiece: 12 });

  const result = account.payForRequestSong();

  test.false(isBusinessError(result));
  if (isBusinessError(result)) return test.fail();

  test.is(result, 'ticket');
  test.is(account.ticket, 2);
  test.is(account.ticketPiece, 12);
});

test('신청곡 신청 시 두 종류의 포인트를 모두 보유하지 않은 경우 실패해야 한다.', async (test) => {
  const account = await accountsFactory.create({ ticketPiece: 2 });

  const result = account.payForRequestSong();

  test.true(isBusinessError(result));
  if (!isBusinessError(result)) return test.fail();

  test.is(result.error, 'not-enough-point');
});
