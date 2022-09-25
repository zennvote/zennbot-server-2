import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WithdrawnEvent } from 'src/domain/accounts/events/withdrawn.event';
import { AccountQuery } from '../queries/accounts.query';

@EventsHandler(WithdrawnEvent)
export class AccountWithdrawnHandler implements IEventHandler<WithdrawnEvent> {
  constructor(private readonly query: AccountQuery) {}

  async handle(event: WithdrawnEvent) {
    await this.query.sync(event);
  }
}
