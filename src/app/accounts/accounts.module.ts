import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AccountsRepository } from './accounts.repository';
import { AccountsController } from './accounts.controller';
import { AccountsApplication } from './accounts.application';
import { AccountCommandHandlers } from './commands';
import { AccountEventHandlers } from './events';
import { AccountQuery } from './queries/accounts.query';

@Module({
  imports: [CqrsModule],
  controllers: [AccountsController],
  providers: [
    AccountsRepository,
    AccountQuery,
    AccountsApplication,
    ...AccountCommandHandlers,
    ...AccountEventHandlers,
  ],
})
export class AccountsModule {}
