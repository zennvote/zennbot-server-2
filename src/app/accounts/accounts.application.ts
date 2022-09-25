import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAccountCommand } from './commands/create-account.command';
import { CreateAccountResult } from './commands/create-account.handler';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsApplication {
  constructor(private readonly commandBus: CommandBus) {}

  async createAccount(createAccountDto: CreateAccountDto) {
    const result = this.commandBus.execute<CreateAccountCommand, CreateAccountResult>(
      new CreateAccountCommand(createAccountDto),
    );

    return result;
  }
}
