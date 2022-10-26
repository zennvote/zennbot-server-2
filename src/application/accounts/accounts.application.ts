import { Injectable } from '@nestjs/common';

import { BusinessError } from 'src/util/business-error';

import { AccountsRepository } from 'src/infrastructure/persistence/accounts/accounts.repository';
import { ViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.repository';

@Injectable()
export class AccountsApplication {
  constructor(
    private readonly viewersRepository: ViewersRepository,
    private readonly accountsRepository: AccountsRepository,
  ) {}

  public async queryAccountProfile(twitchId: string, username: string) {
    const viewer = await this.viewersRepository.findOne(twitchId, username);
    if (!viewer) return new BusinessError('no-viewer');

    const account = await this.accountsRepository.find(viewer.accountId);
    if (!account) return new BusinessError('no-account');

    return { account };
  }
}
