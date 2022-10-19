import { SinonSandbox } from 'sinon';

import { Account } from 'src/domain/accounts/accounts.entity';
import { AccountsRepository } from 'src/domain/accounts/accounts.repository';

export class MockAccountsRepository implements AccountsRepository {
  constructor(public readonly sinon: SinonSandbox) {}

  public findByTwitchIdAndUsername = this.sinon.fake.resolves(null);
  public save = this.sinon.fake(async (account: Account) => account);
}
