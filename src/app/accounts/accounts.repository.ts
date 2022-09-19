import { Injectable } from '@nestjs/common';
import { SheetsService } from 'src/libs/sheets/sheets.service';
import { Account, AccountCreateParams } from './entities/account.entity';

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

    return new Account({ ...accounts, id });
  }
}
