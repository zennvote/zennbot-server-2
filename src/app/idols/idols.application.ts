import { Injectable } from '@nestjs/common';
import { BusinessError } from 'src/util/business-error';
import { IdolsService } from './idols.service';

@Injectable()
export class IdolsApplication {
  constructor(private readonly idolsService: IdolsService) {}

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
}
