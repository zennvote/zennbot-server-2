import { Inject, Injectable } from '@nestjs/common';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import { ViewersRepository, VIEWERS_REPOSITORY } from 'src/domain/viewers/viewers.repository';

@Injectable()
export class ViewersApplication {
  constructor(
    @Inject(VIEWERS_REPOSITORY) private readonly viewersRepository: ViewersRepository,
  ) { }

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

  public async requestMigrationToChzzk(
    twitchId: string,
    twitchUsername: string,
    chzzkId: string,
    chzzkUsername: string,
  ) {
    const viewer = await this.queryViewer(twitchId, twitchUsername);
    if (isBusinessError(viewer)) return viewer;

    const migration = viewer.requestMigrationToChzzk(chzzkId, chzzkUsername);
    if (isBusinessError(migration)) return migration;

    const persisted = await Promise.all([
      this.viewersRepository.save(viewer),
      this.viewersRepository.saveMigration(migration),
    ]);

    return persisted;
  }

  public async acceptMigrationToChzzk(migrationId: string) {
    const migration = await this.viewersRepository.findOneMigration(migrationId);
    if (!migration) return new BusinessError('no-migration');

    const viewer = await this.queryViewer(migration.twitchId, migration.twitchUsername);
    if (isBusinessError(viewer)) return viewer;

    const result = viewer.migrateToChzzk(migration);
    if (isBusinessError(result)) return result;

    const persisted = await Promise.all([
      this.viewersRepository.save(viewer),
      this.viewersRepository.saveMigration(migration),
    ]);

    return persisted;
  }

  public async setBiasIdols(username: string, idolIds: string[]) {
    const viewer = await this.queryViewerByUsername(username);
    if (isBusinessError(viewer)) return viewer;

    viewer.setBiasIdols(idolIds);

    const persisted = await this.viewersRepository.save(viewer);

    return persisted;
  }
}
