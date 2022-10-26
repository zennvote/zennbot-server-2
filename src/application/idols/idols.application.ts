import { Injectable } from '@nestjs/common';

import { BusinessError } from 'src/util/business-error';

import { ViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.repository';

import { IdolsRepository } from 'src/domain/idols/idols.repository';

@Injectable()
export class IdolsApplication {
  constructor(
    private readonly idolsRepository: IdolsRepository,
    private readonly viewersRepository: ViewersRepository,
  ) {}

  public async queryBiasProducer(keyword: string) {
    const idols = await this.idolsRepository.findByKeyword(keyword);
    if (idols.length === 0) return new BusinessError('no-idol');
    if (idols.length > 1) return new BusinessError('multiple-idol');

    const [idol] = idols;
    const viewers = this.viewersRepository.findByBiasIdols(idol.id);

    return viewers;
  }
}
