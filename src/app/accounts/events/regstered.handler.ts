import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RegisteredEvent } from 'src/domain/accounts/events/registered.event';
import { AccountQuery } from '../queries/accounts.query';

@EventsHandler(RegisteredEvent)
export class AccountRegisteredHandler implements IEventHandler<RegisteredEvent> {
  constructor(private readonly query: AccountQuery) {}

  async handle(event: RegisteredEvent) {
    await this.query.sync(event);
  }
}
