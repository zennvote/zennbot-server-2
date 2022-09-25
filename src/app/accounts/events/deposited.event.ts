import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DepositedEvent } from 'src/domain/accounts/events/deposited.event';
import { AccountQuery } from '../queries/accounts.query';

@EventsHandler(DepositedEvent)
export class AccountDepositedHandler implements IEventHandler<DepositedEvent> {
  constructor(private readonly query: AccountQuery) {}

  async handle(event: DepositedEvent) {
    await this.query.sync(event);
  }
}
