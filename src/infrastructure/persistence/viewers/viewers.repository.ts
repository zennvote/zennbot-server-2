import { Injectable } from '@nestjs/common';

import { SheetsService } from 'src/libs/sheets/sheets.service';

import { Viewer } from 'src/domain/viewers/viewers.entity';
import { ViewersRepository as ViewersRepositoryInterface } from 'src/domain/viewers/viewers.repository';

@Injectable()
export class ViewersRepository implements ViewersRepositoryInterface {
  constructor(
    private readonly sheets: SheetsService,
  ) {}

  findOne(twitchId: string, username: string): Promise<Viewer | null> {
    throw new Error('Method not implemented.');
  }

  findByBiasIdols(idolId: number): Promise<Viewer[]> {
    throw new Error('Method not implemented.');
  }

  save(viewer: Viewer): Promise<Viewer> {
    throw new Error('Method not implemented.');
  }
}
