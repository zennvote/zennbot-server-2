import { BusinessError } from 'src/util/business-error';

import { Entity } from 'src/domain/types/entity';

import { ViewerChzzkMigrationRequest } from './viewer-chzzk-migration-request.entity';

export type ViewerProps = {
  id: string;
  twitchId?: string;
  username: string;
  ticket: number;
  ticketPiece: number;
  prefix?: string;
  viasIdolIds: string[];
}

export class Viewer extends Entity {
  public readonly twitchId?: string;
  public readonly username: string;
  public readonly ticket: number;
  public readonly ticketPiece: number;
  public readonly prefix?: string;
  public readonly viasIdolIds: string[];

  constructor(props: ViewerProps) {
    super(props.id);

    this.twitchId = props.twitchId;
    this.username = props.username;
    this.ticket = props.ticket;
    this.ticketPiece = props.ticketPiece;
    this.prefix = props.prefix;
    this.viasIdolIds = props.viasIdolIds;
  }

  public get numaricId() {
    return Number(this.id);
  }

  public setBiasIdols(ids: string[]) {
    this.mutable.viasIdolIds = ids;
  }

  public migrateToChzzk(migration: ViewerChzzkMigrationRequest) {
    if (!this.twitchId || this.twitchId.startsWith('!!chzzk')) {
      return new BusinessError('already-migrated');
    }

    migration.markAsMigrated();

    const migrationLog = `!!chzzk${JSON.stringify(migration)}`;
    this.mutable.twitchId = migrationLog;
    this.mutable.username = migration.chzzkUsername;
  }

  public requestMigrationToChzzk(chzzkId: string, chzzkUsername: string) {
    if (this.twitchId && this.twitchId.startsWith('!!chzzk')) {
      return new BusinessError('already-migrated');
    }

    return new ViewerChzzkMigrationRequest({
      twitchId: this.twitchId || '',
      twitchUsername: this.username,
      chzzkId,
      chzzkUsername,
    });
  }
}
