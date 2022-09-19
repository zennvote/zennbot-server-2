import { Module } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';

@Module({
  providers: [AccountsRepository],
})
export class AccountsModule {}
