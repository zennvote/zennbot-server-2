import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AccountsRepository } from './accounts.repository';
import { AccountsController } from './accounts.controller';
import { AccountsApplication } from './accounts.application';
import { AccountEventHandlers } from './events';
import { AccountCommandHandlers } from './commands';

@Module({
  imports: [CqrsModule],
  controllers: [AccountsController],
  providers: [
    AccountsRepository,
    AccountsApplication,
    ...AccountCommandHandlers,
    ...AccountEventHandlers,
  ],
})
export class AccountsModule {}
