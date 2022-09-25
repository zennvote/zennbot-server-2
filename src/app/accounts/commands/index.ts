import { CreateAccountHandler } from './create-account.handler';
import { DepositePointHandler } from './deposite-point.handler';
import { WithdrawPointHandler } from './withdraw-point.handler';

export const AccountCommandHandlers = [
  CreateAccountHandler,
  DepositePointHandler,
  WithdrawPointHandler,
];
