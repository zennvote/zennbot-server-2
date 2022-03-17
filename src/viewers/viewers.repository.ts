import { Injectable } from '@nestjs/common';
import { SheetsService } from 'src/sheets/sheets.service';
import { Viewer } from './viewers.entity';

@Injectable()
export class ViewersRepository {
  constructor(private readonly sheetsService: SheetsService) {}

  async find(): Promise<Viewer[]> {
    return [];
  }

  async findOne(option: Partial<Viewer> = {}): Promise<Viewer> {
    return null;
  }

  async save(viewer: Viewer): Promise<Viewer> {
    return null;
  }

  async update(option: Partial<Viewer> = {}, value: Partial<Viewer>): Promise<Viewer> {
    return null;
  }
}
