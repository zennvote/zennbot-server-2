import { Inject, Injectable } from '@nestjs/common';
import { sheets_v4 as sheetsV4 } from 'googleapis';

import { SheetsRequest, SHEETS_CLIENT } from './sheets.types';
import { convertToRowType, getIndexFromRange, getRange } from './sheets.util';

const fillDefaultValue = <T extends ReadonlyArray<string>>(
  request: SheetsRequest<T>,
): Required<SheetsRequest<T>> => ({
    startRow: 1,
    startColumn: 1,
    sheetsName: '',
    ...request,
  });

@Injectable()
export class SheetsService {
  constructor(@Inject(SHEETS_CLIENT) private readonly client: sheetsV4.Sheets) { }

  public async getSheets<T extends ReadonlyArray<string>>(request: SheetsRequest<T>) {
    const {
      spreadsheetId, columns, startColumn, startRow, sheetsName,
    } = fillDefaultValue(request);

    const range = getRange({
      sheetsName,
      start: { column: startColumn, row: startRow },
      end: { column: startColumn + columns.length },
    });

    const { data: { values } }
      = await this.client.spreadsheets.values.get({ spreadsheetId, range });

    if (!values) return [];

    const result = values.map((row, index) => convertToRowType(columns, index, row));

    return result;
  }

  public async updateSheets<T extends ReadonlyArray<string>>(
    request: SheetsRequest<T>,
    index: number,
    values: { [key in T[number]]?: any },
  ) {
    const {
      spreadsheetId, columns, startColumn, startRow, sheetsName,
    } = fillDefaultValue(request);

    const range = getRange({
      sheetsName,
      start: { column: startColumn, row: startRow + index },
      end: { column: startColumn + columns.length - 1, row: startRow + index },
    });

    const data = columns.map((column) => values[column]);

    const { data: { updatedData } } = await this.client.spreadsheets.values.update({
      spreadsheetId,
      range,
      includeValuesInResponse: true,
      valueInputOption: 'RAW',
      requestBody: { values: [data] },
    });

    if (!updatedData?.values?.[0]) throw new Error('Cannot get updated data');

    return convertToRowType(columns, index, updatedData.values[0]);
  }

  public async appendRow<T extends ReadonlyArray<string>>(
    request: SheetsRequest<T>,
    values: { [key in T[number]]?: any },
  ) {
    const {
      spreadsheetId, columns, startColumn, startRow, sheetsName,
    } = fillDefaultValue(request);

    const range = getRange({
      sheetsName,
      start: { column: startColumn },
      end: { column: startColumn + columns.length - 1 },
    });
    const data = columns.map((column) => values[column]);

    const { data: { updates } } = await this.client.spreadsheets.values.append({
      spreadsheetId,
      range,
      includeValuesInResponse: true,
      valueInputOption: 'RAW',
      requestBody: { values: [data] },
    });

    if (!updates?.updatedData?.values?.[0] || !updates?.updatedData.range) {
      throw new Error('Cannot get updated data');
    }
    const index = getIndexFromRange(updates.updatedData.range, startRow);

    return convertToRowType(columns, index, updates.updatedData.values[0]);
  }
}
