import { AggregateRoot } from '@nestjs/cqrs';
import { BusinessError } from 'src/util/business-error';
import { DepositedEvent } from './events/deposited.event';
import { WithdrawnEvent } from './events/withdrawn.event';

export type AccountEssentialProps = Required<{
  readonly id: number;
  readonly username: string;
  readonly ticket: number;
  readonly ticketPiece: number;
}>;

export type AccountOptionalProps = Partial<{
  readonly twitchId: string;
  readonly prefix: string;
}>;

export type AccountProps = AccountEssentialProps & AccountOptionalProps;

export enum BalanceType { Ticket, TicketPiece }

export class Account extends AggregateRoot {
  private readonly id!: number;
  private readonly username!: string;
  private readonly twitchId?: string;
  private ticket!: number;
  private ticketPiece!: number;
  private prefix?: string;

  constructor(props: AccountEssentialProps & AccountOptionalProps) {
    super();
    Object.assign(this, props);
  }

  get properties(): AccountProps {
    return {
      id: this.id,
      username: this.username,
      twitchId: this.twitchId,
      ticket: this.ticket,
      ticketPiece: this.ticketPiece,
      prefix: this.prefix,
    };
  }

  deposit(type: BalanceType, amount: number) {
    if (amount < 1) {
      return new BusinessError('no-deposit-amount');
    }

    if (type === BalanceType.Ticket) {
      this.ticket += amount;
    } else if (type === BalanceType.TicketPiece) {
      this.ticketPiece += amount;
    }

    this.apply(Object.assign(new DepositedEvent(), this.properties));
  }

  withdraw(type: BalanceType, amount: number) {
    if (amount < 1) {
      return new BusinessError('no-withdraw-amount');
    }
    const balance = type === BalanceType.Ticket ? this.ticket : this.ticketPiece;
    if (amount > balance) {
      return new BusinessError('withraw-limit-exceeded');
    }

    if (type === BalanceType.Ticket) {
      this.ticket -= amount;
    } else if (type === BalanceType.TicketPiece) {
      this.ticketPiece -= amount;
    }

    this.apply(Object.assign(new WithdrawnEvent(), this.properties));
  }
}
