import { randomUUID } from 'crypto';

import { BusinessError } from 'src/util/business-error';

import { RequestType, Song } from 'src/domain/songs/entities/songs.entity';
import { Entity } from 'src/domain/types/entity';

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
}
