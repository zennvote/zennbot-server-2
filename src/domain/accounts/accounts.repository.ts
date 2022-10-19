import { Account } from 'src/domain/accounts/accounts.entity';

export interface AccountsRepository {
  findByTwitchIdAndUsername(twitchId: string, username: string): Promise<Account | null>;
  save(account: Account): Promise<Account>;
}
