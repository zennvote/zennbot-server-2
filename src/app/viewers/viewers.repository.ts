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

    const viewers = rows
      .filter((row) => row.username)
      .map((row) => ViewersRepository.rowToViewer(row));

    return viewers;
  }

  /**
   * username 혹은 twitchId로 검색할 시 시트 갱신을 위해 {@link findByTwitchIdAndUsername}을 사용할 것을 권장.
   */
  async findOne(option: Partial<Viewer> = {}) {
    const rows = await this.sheetsService.getSheets(this.sheetsInfo);

    const row = rows.find((row) => (
      Object.entries(option).every(([key, value]) => row[key] === value)
    ));
    if (!row) {
      return null;
    }

    const viewer = ViewersRepository.rowToViewer(row);

    return viewer;
  }

  /**
   * 기존 시트 형식의 특성상 twitchId가 nullable하기 때문에 두 정보를 모두 이용하여 검색하고 이를 갱신한다.
   * 해당 시청자의 정보가 최신일 시 갱신하지 않으므로 다중 호출에 대한 비용은 적다.
   */
  async findByTwitchIdAndUsername(username: string, twitchId: string) {
    const rows = await this.sheetsService.getSheets(this.sheetsInfo);

    const row = rows.find((row) => row.username === username || row.twitchId === twitchId);
    if (!row) {
      return null;
    }
    if (row.username !== username || row.twitchId !== twitchId) {
      await this.sheetsService.updateSheets(this.sheetsInfo, row.index, { twitchId, username });
    }

    const viewer = ViewersRepository.rowToViewer(row);

    return viewer;
  }

  async save(viewer: Viewer): Promise<boolean> {
    if (!viewer.index) {
      return false;
    }

    await this.sheetsService.updateSheets(this.sheetsInfo, viewer.index, viewer);

    return true;
  }

  async update(option: Partial<Viewer>, value: Partial<Viewer>): Promise<boolean> {
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

  private static rowToViewer(row: ViewerRow) {
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
