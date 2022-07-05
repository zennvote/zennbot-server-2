import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SheetsService } from 'src/libs/sheets/sheets.service';
import { Idol } from './idols.entity';

@Injectable()
export class IdolsRepository {
  constructor(private readonly sheetsService: SheetsService, private readonly configService: ConfigService) {}

  private readonly sheetsRequest = {
    spreadsheetId: this.configService.get('IDOL_SHEETS_ID'),
    columns: [
      'firstName',
      'lastName',
      'company',
      'unit',
      'type',
      'birthday',
      'age',
      'height',
      'weight',
      'threeSize',
      'hometown',
      'cv',
      'introduction',
    ] as const,
    startRow: 2,
  };

  async search(keyword: string) {
    const rows = await this.sheetsService.getSheets(this.sheetsRequest);

    const idols = rows
      .filter(
        (row) =>
          keyword === row.firstName ||
          keyword === row.lastName ||
          (row.firstName && keyword === `${row.firstName} ${row.lastName}`),
      )
      .map((row) => new Idol(row));

    return idols;
  }
}
