import { Injectable } from '@nestjs/common';
import { IdolsRepository } from './idols.repository';

@Injectable()
export class IdolsService {
  constructor(private readonly idolsRepository: IdolsRepository) {}

  async searchIdols(keyword: string) {
    return this.idolsRepository.search(keyword);
  }
}
