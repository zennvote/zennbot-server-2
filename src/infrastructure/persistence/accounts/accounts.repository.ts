import { Injectable } from '@nestjs/common';

import { Account } from 'src/domain/accounts/accounts.entity';
import { AccountsRepository as AccountsRepositoryInterface } from 'src/domain/accounts/accounts.repository';

@Injectable()
export class AccountsRepository implements AccountsRepositoryInterface {
  async findByTwitchIdAndUsername(twitchId: string, username: string): Promise<Account | null> {
    throw new Error('not implemented');
  }

  async save(account: Account): Promise<Account> {
    throw new Error('not implemented');
  }
}
