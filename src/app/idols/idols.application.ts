import { Injectable } from '@nestjs/common';
import { BusinessError } from 'src/util/business-error';
import { IdolsRepository } from './idols.repository';
import { IdolsService } from './idols.service';

@Injectable()
export class IdolsApplication {
  constructor(
    private readonly idolsService: IdolsService,
    private readonly idolsRepository: IdolsRepository,
  ) { }

  async searchIdol(keyword: string) {
    const result = await this.idolsService.searchIdols(keyword);

    if (result.length > 1) {
      return new BusinessError('multiple-result');
    }
    if (result.length === 0) {
      return new BusinessError('no-result');
    }

    return result[0];
  }

  async getBirthdayIdols() {
    const now = new Date();

    const idol = await this.idolsService.getBirthdayIdols(now);

    if (idol.length === 0) {
      return new BusinessError('no-result');
    }

    return idol;
  }

  async getRandomIdol(company?: string) {
    const idols = await this.idolsRepository.findBy({ company });

    if (!idols.length) {
      return new BusinessError('no-idol');
    }

    const randomIndex = Math.floor(Math.random() * idols.length);

    if (idols.length <= randomIndex) {
      return idols[randomIndex - 1];
    }

    return idols[randomIndex];
  }
}
