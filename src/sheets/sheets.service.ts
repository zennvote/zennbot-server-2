import { Inject, Injectable } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import { SheetRow } from './sheets.interface';

@Injectable()
export class SheetsService {
  constructor(@Inject('CLIENT') private readonly client: sheets_v4.Sheets) {}

  public async getSheets(): Promise<SheetRow[]> {
    const spreadsheetId = process.env.SHEETS_ID;
    const range = process.env.SHEETS_RANGE;

    const {
      data: { values },
    } = await this.client.spreadsheets.values.get({ spreadsheetId, range });

    const result = values
      .map<SheetRow>(
        (row, index): SheetRow => ({
          index: index + 2,
          username: row[0],
          ticket: parseInt(row[2], 10),
          ticketPiece: parseInt(row[1], 10),
          prefix: row[3] || null,
        }),
      )
      .filter((row) => row.username !== null);

    return result;
  }
}
