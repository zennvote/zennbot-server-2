import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BusinessError } from 'src/util/business-error';
import { AccountQuery } from './accounts.query';
import { FindAccountQuery, FindAccountResult } from './find-account.query';

@QueryHandler(FindAccountQuery)
export class FindAccountHandler implements IQueryHandler<FindAccountQuery, FindAccountResult> {
  constructor(private readonly query: AccountQuery) {}

  async execute(query: FindAccountQuery): Promise<FindAccountResult> {
    const account = await this.query.findOne(query.username, query.twitchId);
    if (!account) {
      return new BusinessError('not-found');
    }

    return {
      username: account.username,
      ticket: account.ticket,
      ticketPiece: account.ticketPiece,
      prefix: account.prefix ?? undefined,
    };
  }
}
