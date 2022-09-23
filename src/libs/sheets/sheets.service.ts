import { Inject, Injectable, Logger } from '@nestjs/common';
import { sheets_v4 as sheetsV4 } from 'googleapis';
import { SheetsRequest, SHEETS_CLIENT } from './sheets.types';

const s = (value: number) => String.fromCharCode(value);

@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name);

  constructor(@Inject(SHEETS_CLIENT) private readonly client: sheetsV4.Sheets) { }

  public async getSheets<T extends ReadonlyArray<string>>(request: SheetsRequest<T>) {
    type RowType = { [key in T[number]]: string | undefined };

    const { spreadsheetId, columns } = request;
    const sheetsName = '';
    const startColumn = request.startColumn ?? 1;
    const startRow = request.startRow ?? 1;

    const range = `${sheetsName}!${s(64 + startColumn)}${startRow}:${s(64 + startColumn + columns.length)}`;

    const {
      data: { values },
    } = await this.client.spreadsheets.values.get({ spreadsheetId, range });

    if (!values) {
      return [] as ({ index: number } & RowType)[];
    }

    const result = values.map((row, index) => ({
      index,
      ...(Object.fromEntries(
        row
          .map((value, keyIndex) => (
            columns[keyIndex] ? [columns[keyIndex], value as string] : undefined
          ))
          .filter((value): value is string[] => value !== undefined),
      ) as RowType),
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

    const columnTable = Object.fromEntries(
      columns.map((column, columnIndex) => [column, s(64 + startColumn + columnIndex)]),
    );

    const data = Object
      .entries(values)
      .filter(([key]) => !!columnTable[key])
      .map(([key, value]) => ({
        range: `${sheetsName}!${columnTable[key]}${index + startRow}`,
        values: [[value]],
      }));

    this.logger.verbose('updateSheets > sheets update requested', { request, index, values });

    const response = await this.client.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { data, valueInputOption: 'RAW' },
    });

    this.logger.verbose('updateSheets > sheets updated', { response });
  }

  public async appendRow<T extends ReadonlyArray<string>>(
    request: SheetsRequest<T>,
    values: { [key in T[number]]?: any },
  ) {
    const { spreadsheetId, columns } = request;
    const sheetsName = request.sheetsName ?? '';
    const startColumn = request.startColumn ?? 1;
    const startRow = request.startRow ?? 1;

    const value = [columns.map((column) => values[column])];

    this.logger.verbose('appendRow > sheets update requested', { request, values });

    const response = await this.client.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetsName}!${s(64 + startColumn)}:${s(64 + startColumn + columns.length)}`,
      includeValuesInResponse: true,
      valueInputOption: 'RAW',
      requestBody: { values: value },
    });

    this.logger.verbose('appendRow > sheets updated', { response });

    const { updatedRange } = response.data.updates ?? {};
    const index = parseInt(updatedRange?.match(/.*!(?:\w+?)(\d+)/)?.[1] ?? '0', 10);

    if (index === 0) {
      throw new Error('Unexpected Error during appendRow');
    }

    return index - startRow;
  }
}
