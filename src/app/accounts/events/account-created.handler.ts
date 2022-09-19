import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MainLogger } from 'src/util/logger';
import { AccountCreatedEvent } from './account-created.event';

@EventsHandler(AccountCreatedEvent)
export class AccountCreatedHandler implements IEventHandler<AccountCreatedEvent> {
  private readonly logger = new MainLogger(AccountCreatedHandler.name);

  async handle(event: AccountCreatedEvent) {
    this.logger.log('Account Created: ', event.accountId);
  }
}
