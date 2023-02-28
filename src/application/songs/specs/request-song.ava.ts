/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import anyTest, { TestFn } from 'ava';
import { SinonSandbox } from 'sinon';

type TestContext = {
  sandbox: SinonSandbox;
};
const test = anyTest as TestFn<TestContext>;

test.todo('신청곡 신청 및 결제가 완료되어야 한다');
test.todo('조각을 통한 신청곡 신청 및 결제가 완료되어야 한다');
test.todo('골든벨일 시 포인트 소모 없이 신청되어야 한다');
test.todo('신청 비활성화 시 실패해야 한다');
test.todo('존재하지 않는 시청자의 경우 실패해야 한다.');
test.todo('포인트가 부족한 경우 실패해야 한다.');
test.todo('골든벨일 경우 포인트가 부족해도 신청 가능해야 한다.');
test.todo('쿨타임인 경우 실패해야 한다.');
