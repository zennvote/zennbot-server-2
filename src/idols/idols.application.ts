import { Injectable } from '@nestjs/common';
import { IdolsService } from './idols.service';

@Injectable()
export class IdolsApplication {
  constructor(private readonly idolsService: IdolsService) {}

  async searchIdol(keyword: string) {}
}
