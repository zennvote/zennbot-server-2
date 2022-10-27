import { Injectable } from '@nestjs/common';

import { BusinessError } from 'src/util/business-error';

import { ViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.repository';

@Injectable()
export class ViewersApplication {
  constructor(
    private readonly viewersRepository: ViewersRepository,
  ) {}

  public async queryViewer(twitchId: string, username: string) {
    const viewer = await this.viewersRepository.findOne(twitchId, username);
    if (!viewer) return new BusinessError('no-viewer');

    return viewer;
  }
}
