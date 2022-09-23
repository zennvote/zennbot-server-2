import { Injectable } from '@nestjs/common';
import { Account, AccountProps } from 'src/domain/accounts/accounts.entity';
import { SheetsService } from 'src/libs/sheets/sheets.service';

type ViewerRow = {
  index: number;
  username?: string;
  twitchId?: string;
  ticket?: string;
  ticketPiece?: string;
  prefix?: string;
};

@Injectable()
export class AccountsRepository {
  private readonly sheetsInfo = {
    spreadsheetId: process.env.SHEETS_ID ?? '',
    columns: ['twitchId', 'username', 'ticketPiece', 'ticket', 'prefix'] as const,
    startRow: 6,
  };

  constructor(private readonly sheetsService: SheetsService) {}

  async findAccount(username: string, twitchId?: string) {
    const rows = await this.sheetsService.getSheets(this.sheetsInfo);

    const row = rows.find((row) => row.username === username || row.twitchId === twitchId);
    if (!row) {
      return null;
    }
    if (row.username !== username || row.twitchId !== twitchId) {
      await this.sheetsService.updateSheets(this.sheetsInfo, row.index, { twitchId, username });
    }

    const account = AccountsRepository.rowToViewer(row);

    return account;
  }

  async create(accounts: Omit<AccountProps, 'id'>) {
    const id = await this.sheetsService.appendRow(this.sheetsInfo, accounts);
    const account = new Account({ ...accounts, id });

    return account;
  }

  private static rowToViewer(row: ViewerRow) {
    if (!row.username) {
      return null;
    }

    return new Account({
      id: row.index,
      username: row.username,
      twitchId: row.twitchId,
      ticket: Number.parseInt(row.ticket ?? '0', 10),
      ticketPiece: Number.parseInt(row.ticketPiece ?? '0', 10),
      prefix: row.prefix,
    });
  }
}
