import { Inject, Injectable } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import { SheetsRequest, SHEETS_CLIENT } from './sheets.types';

const s = (value: number) => String.fromCharCode(value);

@Injectable()
export class SheetsService {
  constructor(@Inject(SHEETS_CLIENT) private readonly client: sheets_v4.Sheets) {}

  public async getSheets<T extends ReadonlyArray<string>>(request: SheetsRequest<T>) {
    const { spreadsheetId, columns } = request;
    const sheetsName = '';
    const startColumn = request.startColumn ?? 1;
    const startRow = request.startRow ?? 1;

    const range = `${sheetsName}!${s(64 + startColumn)}${startRow}:${s(64 + startColumn + columns.length)}`;

    const {
      data: { values },
    } = await this.client.spreadsheets.values.get({ spreadsheetId, range });

    const result = values.map((row, index) => ({
      index,
      ...(Object.fromEntries(
        row
          .map((value, keyIndex) => {
            return columns[keyIndex] ? [columns[keyIndex], value as string] : undefined;
          })
          .filter((value) => value),
      ) as { [key in T[number]]: string | undefined }),
    }));

    return result;
  }

  public async updateSheets<T extends ReadonlyArray<string>>(
    request: SheetsRequest<T>,
    index: number,
    values: { [key in T[number]]?: any },
  ) {
    const { spreadsheetId, columns } = request;
    const sheetsName = '';
    const startColumn = request.startColumn ?? 1;
    const startRow = request.startRow ?? 1;

    const columnTable = Object.fromEntries(columns.map((column, index) => [column, s(64 + startColumn + index)]));

    const data = Object.entries(values).map(([key, value]) => {
      return {
        range: `${sheetsName}!${columnTable[key]}${index + startRow}`,
        values: [[value]],
      };
    });

    await this.client.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { data, valueInputOption: 'RAW' },
    });
  }
}
