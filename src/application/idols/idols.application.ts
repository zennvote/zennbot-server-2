import { Inject, Injectable } from '@nestjs/common';

import { BusinessError } from 'src/util/business-error';

import { IdolsRepository, IDOLS_REOPSITORY } from 'src/domain/idols/idols.repository';
import { ViewersRepository, VIEWERS_REPOSITORY } from 'src/domain/viewers/viewers.repository';

@Injectable()
export class IdolsApplication {
  constructor(
    @Inject(IDOLS_REOPSITORY) private readonly idolsRepository: IdolsRepository,
    @Inject(VIEWERS_REPOSITORY) private readonly viewersRepository: ViewersRepository,
  ) {}

  public async queryIdols() {
    return this.idolsRepository.all();
  }

  public async queryBiasProducer(keyword: string) {
    const idols = await this.idolsRepository.findByKeyword(keyword);
    if (idols.length === 0) return new BusinessError('no-idol');
    if (idols.length > 1) return new BusinessError('multiple-idol');

    const [idol] = idols;
    const viewers = await this.viewersRepository.findByBiasIdols(idol.numaricId);

    return { idol, viewers };
  }
}
