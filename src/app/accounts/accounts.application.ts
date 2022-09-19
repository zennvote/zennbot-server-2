import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAccountCommand } from './commands/create-account.command';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsApplication {
  constructor(private readonly commandBus: CommandBus) {}

  async createAccount(createAccountDto: CreateAccountDto) {
    await this.commandBus.execute(
      new CreateAccountCommand(createAccountDto),
    );
  }
}
