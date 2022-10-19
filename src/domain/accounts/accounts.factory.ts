import { Factory } from 'fishery';
import { Account, AccountProps } from './accounts.entity';

export const accountsFactory = Factory.define<AccountProps, Record<string, never>, Account>(
  ({ params, sequence, onCreate }) => {
    onCreate((props) => new Account(props));

    return {
      id: sequence,
      twitchId: `testviewer${sequence}`,
      username: `테스트시청자${sequence}`,
      ticket: 0,
      ticketPiece: 0,
      prefix: undefined,
      ...params,
    };
  },
);
