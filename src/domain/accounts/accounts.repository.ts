import { Account } from './accounts.entity';

export interface AccountsRepository {
  findByTwitchIdAndUsername(twitchId: string, username: string): Promise<Account | null>;
  find(id: number): Promise<Account | null>;
  save(account: Account): Promise<Account>;
}
