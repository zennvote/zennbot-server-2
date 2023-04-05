import { Inject, Injectable } from '@nestjs/common';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import { ViewersRepository, VIEWERS_REPOSITORY } from 'src/domain/viewers/viewers.repository';

@Injectable()
export class ViewersApplication {
  constructor(
    @Inject(VIEWERS_REPOSITORY) private readonly viewersRepository: ViewersRepository,
  ) {}

  public async queryViewerByUsername(username: string) {
    const viewer = await this.viewersRepository.findOneByUsername(username);
    if (!viewer) return new BusinessError('no-viewer');

    return viewer;
  }

  public async queryViewer(twitchId: string, username: string) {
    const viewer = await this.viewersRepository.findOne(twitchId, username);
    if (!viewer) return new BusinessError('no-viewer');

    return viewer;
  }

  public async setBiasIdols(username: string, idolIds: string[]) {
    const viewer = await this.queryViewerByUsername(username);
    if (isBusinessError(viewer)) return viewer;

    viewer.setBiasIdols(idolIds);

    const persisted = await this.viewersRepository.save(viewer);

    return persisted;
  }
}
