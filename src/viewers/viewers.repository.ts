import { Injectable } from '@nestjs/common';
import { SheetsService } from 'src/sheets/sheets.service';
import { Viewer } from './viewers.entity';

@Injectable()
export class ViewersRepository {
  constructor(private readonly sheetsService: SheetsService) {}

  async find(): Promise<Viewer[]> {
    const rows = await this.sheetsService.getSheets();
    const viewers = rows.map((row) => new Viewer(row));

    return viewers;
  }

  async findOne(option: Partial<Viewer> = {}): Promise<Viewer | null> {
    const rows = await this.sheetsService.getSheets();
    const row = rows.find((row) => {
      return Object.entries(option).every(([key, value]) => row[key] === value);
    });
    if (!row) {
      return null;
    }

    const viewer = new Viewer(row);

    return viewer;
  }

  async update(option: Partial<Viewer> = {}, value: Partial<Viewer>): Promise<Viewer> {
    return null;
  }
}
