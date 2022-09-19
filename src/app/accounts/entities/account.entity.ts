import { AggregateRoot } from '@nestjs/cqrs';

export interface AccountCreateParams {
  id: number;
  username: string;
  twitchId?: string;
  ticket: number;
  ticketPiece: number;
  prefix?: string;
}

export class Account extends AggregateRoot {
  public readonly id: number;

  public readonly username: string;

  public readonly twitchId?: string;

  public readonly ticket: number;

  public readonly ticketPiece: number;

  public readonly prefix?: string;

  constructor(params: AccountCreateParams) {
    super();

    this.id = params.id;
    this.username = params.username;
    this.twitchId = params.twitchId;
    this.ticket = params.ticket;
    this.ticketPiece = params.ticketPiece;
    this.prefix = params.prefix;
  }
}
