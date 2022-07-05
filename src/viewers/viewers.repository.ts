import { Injectable } from '@nestjs/common';
import { SheetsService } from 'src/libs/sheets/sheets.service';
import { Viewer } from './viewers.entity';

type ViewerRow = {
  index: number;
  username?: string;
  twitchId?: string;
  ticket?: string;
  ticketPiece?: string;
  prefix?: string;
};

@Injectable()
export class ViewersRepository {
  constructor(private readonly sheetsService: SheetsService) {}

  private readonly sheetsInfo = {
    spreadsheetId: process.env.SHEETS_ID ?? '',
    columns: ['twitchId', 'username', 'ticketPiece', 'ticket', 'prefix'] as const,
    startRow: 6,
  };

  async find() {
    const rows = await this.sheetsService.getSheets(this.sheetsInfo);

    const viewers = rows.filter((row) => row.username).map((row) => this.rowToViewer(row));

    return viewers;
  }

  async findOne(option: Partial<Viewer> = {}) {
    const rows = await this.sheetsService.getSheets(this.sheetsInfo);

    const row = rows.find((row) => {
      return Object.entries(option).every(([key, value]) => row[key] === value);
    });
    if (!row) {
      return null;
    }

    const viewer = this.rowToViewer(row);

    return viewer;
  }

  async update(option: Partial<Viewer> = {}, value: Partial<Viewer>): Promise<boolean> {
    if (option.index !== undefined && Object.keys(option).length === 1) {
      await this.sheetsService.updateSheets(this.sheetsInfo, option.index, value);
      return true;
    }
    const viewer = await this.findOne(option);
    if (!viewer) {
      return false;
    }

    await this.sheetsService.updateSheets(this.sheetsInfo, viewer.index, value);
    return true;
  }

  private rowToViewer(row: ViewerRow) {
    if (!row.username) {
      return null;
    }

    return new Viewer({
      index: row.index,
      username: row.username,
      twitchId: row.twitchId,
      ticket: Number.parseInt(row.ticket ?? '0', 10),
      ticketPiece: Number.parseInt(row.ticketPiece ?? '0', 10),
      prefix: row.prefix,
    });
  }
}
