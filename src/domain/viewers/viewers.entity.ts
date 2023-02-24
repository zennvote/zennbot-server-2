import { randomUUID } from 'crypto';

import { BusinessError } from 'src/util/business-error';

import { RequestType, Song } from 'src/domain/songs/entities/songs.entity';
import { SongsService } from 'src/domain/songs/songs.service';
import { Entity } from 'src/domain/types/entity';

export type ViewerProps = {
  id: string;
  twitchId?: string;
  username: string;
  ticket: number;
  ticketPiece: number;
  prefix?: string;
  viasIdolIds: number[];
}

export class Viewer extends Entity {
  public readonly twitchId?: string;
  public readonly username: string;
  public readonly ticket: number;
  public readonly ticketPiece: number;
  public readonly prefix?: string;
  public readonly viasIdolIds: number[];

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

  public async requestSong(title: string, isFreemode: boolean, songsService: SongsService) {
    const isInCooltime = await songsService.isViewerInCooltime(this);
    if (isInCooltime) return new BusinessError('in-cooltime');

    if (!isFreemode && (this.ticket < 1 && this.ticketPiece < 3)) return new BusinessError('not-enough-point');

    const requestType = this.getRequestType(isFreemode);
    switch (requestType) {
      case RequestType.ticket:
        this.mutable.ticket -= 1;
        break;
      case RequestType.ticketPiece:
        this.mutable.ticketPiece -= 3;
        break;
    }

    return new Song({
      id: randomUUID(),
      title,
      requestorId: this.id,
      requestType,
    });
  }

  public setBiasIdols(ids: number[]) {
    this.mutable.viasIdolIds = ids;
  }

  private getRequestType(isFreemode: boolean) {
    if (isFreemode) return RequestType.freemode;
    if (this.ticket > 0) return RequestType.ticket;

    return RequestType.ticketPiece;
  }
}
