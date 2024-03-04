import { ViewerChzzkMigrationRequest } from './viewer-chzzk-migration-request.entity';
import { Viewer } from './viewers.entity';

export const VIEWERS_REPOSITORY = 'VIEWERS_REPOSITORY';

export interface ViewersRepository {
  findOne(twitchId: string, username: string): Promise<Viewer | null>;
  findOneByUsername(username: string): Promise<Viewer | null>;
  findByBiasIdols(idolId: number): Promise<Viewer[]>
  save(viewer: Viewer): Promise<Viewer>;
  saveMigration(migration: ViewerChzzkMigrationRequest): Promise<ViewerChzzkMigrationRequest>;
  findOneMigration(migrationId: string): Promise<ViewerChzzkMigrationRequest | null>;
}
