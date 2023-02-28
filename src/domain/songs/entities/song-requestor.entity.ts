import { BusinessError } from 'src/util/business-error';

import { Entity } from 'src/domain/types/entity';

import { RequestType } from './songs.entity';

export type SongRequestorProps = {
  id: string;
  username: string;
  twitchId?: string;
  ticket: number;
  ticketPiece: number;
};

export class SongRequestor extends Entity {
  public readonly username: string;
  public readonly twitchId?: string;
  public readonly ticket: number;
  public readonly ticketPiece: number;

  constructor(props: SongRequestorProps) {
    super(props.id);

    this.username = props.username;
    this.twitchId = props.twitchId;
    this.ticket = props.ticket;
    this.ticketPiece = props.ticketPiece;
  }

  get numaricId() {
    return parseInt(this.id, 10) ?? -1;
  }

  payForRequest() {
    if (this.ticket >= 1) {
      this.mutable.ticket -= 1;
      return RequestType.ticket;
    }
    if (this.ticketPiece >= 3) {
      this.mutable.ticketPiece -= 3;
      return RequestType.ticketPiece;
    }
    return new BusinessError('not-enough-point');
  }
}
