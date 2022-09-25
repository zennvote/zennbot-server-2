import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { BusinessError } from 'src/util/business-error';
import { AccountsRepository } from '../accounts.repository';
import { WithdrawPointCommand } from './withdraw-point.command';

export type WithdrawPointResult = BusinessError<'not-found'> | void;

@CommandHandler(WithdrawPointCommand)
export class WithdrawPointHandler
implements ICommandHandler<WithdrawPointCommand, WithdrawPointResult> {
  constructor(
    private readonly accountRepotiroy: AccountsRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: WithdrawPointCommand): Promise<WithdrawPointResult> {
    const {
      username, twitchId, amount, type,
    } = command.withdrawPointDto;

    const data = await this.accountRepotiroy.findAccount(username, twitchId);
    if (!data) return new BusinessError('not-found');

    const account = this.eventPublisher.mergeObjectContext(data);

    account.withdraw(type, amount);

    await this.accountRepotiroy.save(account);

    account.commit();
  }
}
