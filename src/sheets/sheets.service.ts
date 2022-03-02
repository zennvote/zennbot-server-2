import { Inject, Injectable } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import { SheetRow } from './sheets.interface';

@Injectable()
export class SheetsService {
  constructor(@Inject('CLIENT') private readonly client: sheets_v4.Sheets) {}

  private async getSheets(): Promise<SheetRow[]> {
    const spreadsheetId = process.env.SHEETS_ID;
    const range = process.env.SHEETS_RANGE;

    const {
      data: { values },
    } = await this.client.spreadsheets.values.get({ spreadsheetId, range });

    const result = values
      .map<SheetRow>(
        (row, index): SheetRow => ({
          index: index + 2,
          twitchId: row[0] || null,
          username: row[1] || null,
          ticket: parseInt(row[2], 10),
          ticketPiece: parseInt(row[3], 10),
          etc: row[4] || null,
        }),
      )
      .filter((row) => row.username !== null);

    return result;
  }
}
