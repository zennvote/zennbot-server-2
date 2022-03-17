import { Inject, Injectable } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import { SheetRow } from './sheets.interface';

@Injectable()
export class SheetsService {
  constructor(@Inject('CLIENT') private readonly client: sheets_v4.Sheets) {}

  public async getSheets(): Promise<SheetRow[]> {
    const spreadsheetId = process.env.SHEETS_ID;
    const range = '시트1!A6:E';

    const {
      data: { values },
    } = await this.client.spreadsheets.values.get({ spreadsheetId, range });

    const result = values
      .map<SheetRow>(
        (row, index): SheetRow => ({
          index: index,
          twitchId: row[0],
          username: row[1],
          ticketPiece: parseInt(row[2], 10),
          ticket: parseInt(row[3], 10),
          prefix: row[4] || null,
        }),
      )
      .filter((row) => row.username !== null);

    return result;
  }

  public async updateSheets(index: number, value: Partial<SheetRow>) {
    const spreadsheetId = process.env.SHEETS_ID;

    const rangeMap: { [key: string]: string } = {
      twitchId: 'A',
      username: 'B',
      ticketPiece: 'C',
      ticket: 'D',
      prefix: 'E',
    };
    const data = Object.entries(value)
      .filter(([key]) => key in rangeMap)
      .map(([key, value]) => ({
        range: `시트1!${rangeMap[key]}${index + 6}`,
        values: [[`${value}`]],
      }));

    await this.client.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { data, valueInputOption: 'RAW' },
    });
  }
}
