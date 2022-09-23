import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AccountEvents } from 'src/domain/accounts/events';
import { BusinessError } from 'src/util/business-error';
import { AccountsRepository } from '../accounts.repository';
import { CreateAccountCommand } from './create-account.command';

export type CreateAccountResult = BusinessError<'already-exists'> | void;

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler
implements ICommandHandler<CreateAccountCommand, CreateAccountResult> {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateAccountCommand) {
    const { username, twitchId } = command.createAccountDto;

    const exist = await this.accountsRepository.findAccount(username, twitchId);
    if (exist) {
      return new BusinessError('already-exists');
    }

    const account = this.eventPublisher.mergeObjectContext(
      await this.accountsRepository.create({
        username, twitchId, ticket: 1, ticketPiece: 3,
      }),
    );

    account.publish(Object.assign(new AccountEvents.RegisteredEvent(), account.properties));

    account.commit();
  }
}
