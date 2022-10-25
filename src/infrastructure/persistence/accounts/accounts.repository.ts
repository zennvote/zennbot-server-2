import { Injectable } from '@nestjs/common';

import { SheetsService } from 'src/libs/sheets/sheets.service';

import { Account } from 'src/domain/accounts/accounts.entity';
import { AccountsRepository as AccountsRepositoryInterface } from 'src/domain/accounts/accounts.repository';

type AccountDataModel = {
  index: number;
  username?: string;
  twitchId?: string;
  ticket?: string;
  ticketPiece?: string;
  prefix?: string;
};

@Injectable()
export class AccountsRepository implements AccountsRepositoryInterface {
  private readonly sheetsInfo = {
    spreadsheetId: process.env.SHEETS_ID ?? '',
    columns: ['twitchId', 'username', 'ticketPiece', 'ticket', 'prefix'] as const,
    startRow: 6,
  };

  constructor(private readonly sheetsService: SheetsService) {}

  async find(id: number): Promise<Account | null> {
    const rows = await this.sheetsService.getSheets(this.sheetsInfo);
    const row = rows[id];

    if (!row) {
      return null;
    }

    return convertFromDataModel(row);
  }

  async findByTwitchIdAndUsername(twitchId: string, username: string): Promise<Account | null> {
    const rows = await this.sheetsService.getSheets(this.sheetsInfo);

    const row = rows.find((row) => row.username === username || row.twitchId === twitchId);
    if (!row) {
      return null;
    }
    if (row.username !== username || row.twitchId !== twitchId) {
      await this.sheetsService.updateSheets(
        this.sheetsInfo,
        row.index,
        { ...row, twitchId, username },
      );
    }

    const account = convertFromDataModel(row);

    return account;
  }

  async save(account: Account): Promise<Account> {
    if (!account.persisted) {
      return this.create(account);
    }

    const updated = await this.sheetsService.updateSheets(this.sheetsInfo, account.id, account);

    return convertFromDataModel(updated);
  }

  private async create(account: Account): Promise<Account> {
    const created = await this.sheetsService.appendRow(
      this.sheetsInfo,
      convertToDataModel(account),
    );

    return convertFromDataModel(created);
  }
}

const convertFromDataModel = (row: AccountDataModel) => {
  if (!row.username) {
    throw new Error(`no username in sheets: ${JSON.stringify(row)}`);
  }

  return new Account({
    id: row.index,
    username: row.username,
    twitchId: row.twitchId,
    ticket: Number.parseInt(row.ticket ?? '0', 10),
    ticketPiece: Number.parseInt(row.ticketPiece ?? '0', 10),
    prefix: row.prefix,
  });
};

const convertToDataModel = (account: Account): AccountDataModel => ({
  index: account.id,
  twitchId: account.twitchId,
  username: account.username,
  ticket: `${account.ticket}`,
  ticketPiece: `${account.ticketPiece}`,
  prefix: account.prefix,
});
