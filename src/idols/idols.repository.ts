import { Injectable } from '@nestjs/common';
import { SheetsService } from 'src/sheets/sheets.service';

@Injectable()
export class IdolsRepository {
  constructor(private readonly sheetsService: SheetsService) {}

  async search(keyword: string) {}
}
