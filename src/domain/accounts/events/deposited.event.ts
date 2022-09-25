import { IEvent } from '@nestjs/cqrs';
import { AccountProps } from '../accounts.entity';

export class DepositedEvent implements IEvent, AccountProps {
  readonly id!: number;
  readonly username!: string;
  readonly ticket!: number;
  readonly ticketPiece!: number;
  readonly twitchId?: string | undefined;
  readonly prefix?: string | undefined;
}
