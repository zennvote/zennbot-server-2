import { AccountDepositedHandler } from './deposited.event';
import { AccountRegisteredHandler } from './regstered.handler';
import { AccountWithdrawnHandler } from './withdrawn.event';

export const AccountEventHandlers = [
  AccountRegisteredHandler,
  AccountDepositedHandler,
  AccountWithdrawnHandler,
];
