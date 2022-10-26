import { Module } from '@nestjs/common';

import { AccountsApplication } from 'src/application/accounts/accounts.application';

import { AccountsController } from './accounts.controller';

@Module({
  controllers: [AccountsController],
  providers: [AccountsApplication],
})
export class AccountsModule {}
