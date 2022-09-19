import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AccountsRepository } from '../accounts.repository';
import { CreateAccountCommand } from './create-account.command';

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler implements ICommandHandler<CreateAccountCommand> {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateAccountCommand): Promise<void> {
    const { username, twitchId } = command.createAccountDto;

    const account = this.eventPublisher.mergeObjectContext(
      await this.accountsRepository.create({
        username, twitchId, ticket: 1, ticketPiece: 3,
      }),
    );

    account.commit();
  }
}
