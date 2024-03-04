import { randomUUID } from 'crypto';

import { Entity } from '../types/entity';

export type ViewerChzzkMigrationRequestProps = {
  id?: string;
  twitchId: string;
  twitchUsername: string;
  chzzkId: string;
  chzzkUsername: string;
  migrated?: boolean;
}

export class ViewerChzzkMigrationRequest extends Entity {
  public readonly twitchId: string;
  public readonly twitchUsername: string;
  public readonly chzzkId: string;
  public readonly chzzkUsername: string;
  public readonly migrated: boolean = false;

  constructor(props: ViewerChzzkMigrationRequestProps) {
    super(props.id ?? randomUUID());

    this.twitchId = props.twitchId;
    this.twitchUsername = props.twitchUsername;
    this.chzzkId = props.chzzkId;
    this.chzzkUsername = props.chzzkUsername;
    this.migrated = props.migrated ?? false;
  }

  markAsMigrated() {
    this.mutable.migrated = true;
  }
}
