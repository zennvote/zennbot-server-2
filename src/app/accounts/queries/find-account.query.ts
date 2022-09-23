import { IQuery } from '@nestjs/cqrs';
import { BusinessError } from 'src/util/business-error';

export class FindAccountQuery implements IQuery {
  constructor(readonly username: string, readonly twitchId?: string) {}
}

type AccountResult = {
  readonly username: string,
  readonly ticket: number;
  readonly ticketPiece: number;
  readonly prefix?: string;
}

export type FindAccountResult = AccountResult | BusinessError<'not-found'>;
