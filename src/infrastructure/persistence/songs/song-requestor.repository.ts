import { Injectable } from '@nestjs/common';

import { SheetsService } from 'src/libs/sheets/sheets.service';

import { SongRequestor } from 'src/domain/songs/entities/song-requestor.entity';
import {
  SONG_REQUESTOR_REPOSITORY,
  SongRequestorRepository as SongRequestorRepositoryInterface,
} from 'src/domain/songs/repositories/song-requestor.repository';

type SongRequestorDataModel = {
  index: number;
  twitchId?: string;
  username?: string;
  ticketPiece?: string;
  ticket?: string;
  prefix?: string;
}

@Injectable()
export class SongRequestorRepository implements SongRequestorRepositoryInterface {
  private readonly sheetsInfo = {
    spreadsheetId: process.env.SHEETS_ID ?? '',
    columns: [
      'twitchId',
      'username',
      'ticketPiece',
      'ticket',
      'prefix',
    ] as const,
    startRow: 6,
  };

  constructor(
    private readonly sheets: SheetsService,
  ) {}

  async get(twitchId: string, username: string) {
    const rows = await this.sheets.getSheets(this.sheetsInfo);

    const row = rows.find((row) => row.twitchId === twitchId || row.username === username);
    if (!row) return null;

    if (row.username !== username || row.twitchId !== twitchId) {
      await this.sheets.updateSheets(this.sheetsInfo, row.index, { twitchId, username });
    }

    return this.convertFromDataModel(row);
  }

  async getByUsername(username: string): Promise<SongRequestor | null> {
    const rows = await this.sheets.getSheets(this.sheetsInfo);

    const row = rows.find((row) => row.username === username);
    if (!row) return null;

    return this.convertFromDataModel(row);
  }

  async save(requestor: SongRequestor): Promise<SongRequestor> {
    if ((requestor.numaricId ?? -1) < -1) return this.create(requestor);

    const update = this.convertToDataModel(requestor);
    const result = await this.sheets.updateSheets(this.sheetsInfo, requestor.numaricId, update);

    return this.convertFromDataModel(result);
  }

  private async create(songRequestor: SongRequestor): Promise<SongRequestor> {
    const datamodel = this.convertToDataModel(songRequestor);
    const result = await this.sheets.appendRow(this.sheetsInfo, datamodel);

    return this.convertFromDataModel(result);
  }

  private convertToDataModel(requestor: SongRequestor): Omit<SongRequestorDataModel, 'index'> {
    return {
      twitchId: requestor.twitchId,
      username: requestor.username,
      ticketPiece: requestor.ticketPiece.toString(),
      ticket: requestor.ticket.toString(),
    };
  }

  private convertFromDataModel(datamodel: SongRequestorDataModel) {
    if (
      !datamodel.username ||
      datamodel.ticket === undefined ||
      datamodel.ticketPiece === undefined
    ) {
      throw new Error(`invalid song datamodel: ${JSON.stringify(datamodel)}`);
    }

    return new SongRequestor({
      id: `${datamodel.index}`,
      twitchId: datamodel.twitchId,
      username: datamodel.username,
      ticket: parseInt(datamodel.ticket, 10),
      ticketPiece: parseInt(datamodel.ticketPiece, 10),
    });
  }
}

export const SongRequestorRepositoryProvider = {
  provide: SONG_REQUESTOR_REPOSITORY,
  useClass: SongRequestorRepository,
};
