import { Injectable } from '@nestjs/common';
import { SheetsService } from 'src/libs/sheets/sheets.service';
import { Account, AccountCreateParams } from './entities/account.entity';
import { AccountCreatedEvent } from './events/account-created.event';

@Injectable()
export class AccountsRepository {
  private readonly sheetsInfo = {
    spreadsheetId: process.env.SHEETS_ID ?? '',
    columns: ['twitchId', 'username', 'ticketPiece', 'ticket', 'prefix'] as const,
    startRow: 6,
  };

  constructor(private readonly sheetsService: SheetsService) {}

  async create(accounts: Omit<AccountCreateParams, 'id'>) {
    const id = await this.sheetsService.appendRow(this.sheetsInfo, accounts);
    const account = new Account({ ...accounts, id });

    account.apply(new AccountCreatedEvent(id));

    return account;
  }
}
