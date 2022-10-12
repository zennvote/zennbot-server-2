import { Injectable } from '@nestjs/common';

import { Account } from 'src/domain/accounts/accounts.entity';

@Injectable()
export class AccountsRepository {
  async findByTwitchIdAndUsername(twitchId: string, username: string): Promise<Account | null> {
    throw new Error('not implemented');
  }

  async save(account: Account): Promise<Account> {
    throw new Error('not implemented');
  }
}
