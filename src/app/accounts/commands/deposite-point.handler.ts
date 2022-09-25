import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { BusinessError } from 'src/util/business-error';
import { AccountsRepository } from '../accounts.repository';
import { DepositePointCommand } from './deposite-point.command';

export type DepositePointResult = BusinessError<'not-found'> | void;

@CommandHandler(DepositePointCommand)
export class DepositePointHandler
implements ICommandHandler<DepositePointCommand, DepositePointResult> {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DepositePointCommand) {
    const {
      username, twitchId, amount, type,
    } = command.depositePointDto;

    const data = await this.accountsRepository.findAccount(username, twitchId);
    if (!data) return new BusinessError('not-found');

    const account = this.eventPublisher.mergeObjectContext(data);

    account.deposit(type, amount);

    await this.accountsRepository.save(account);

    account.commit();
  }
}
