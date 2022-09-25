import { BalanceType } from 'src/domain/accounts/accounts.entity';

export class WithdrawPointDto {
  constructor(
    public username: string,
    public type: BalanceType,
    public amount: number,
    public twitchId?: string,
  ) {}
}
