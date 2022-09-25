import { BalanceType } from 'src/domain/accounts/accounts.entity';

export class DepositePointDto {
  constructor(
    public username: string,
    public type: BalanceType,
    public amount: number,
    public twitchId?: string,
  ) {}
}
