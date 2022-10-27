import { BusinessError } from 'src/util/business-error';

import { RequestType, Song } from 'src/domain/songs/songs.entity';
import { SongsService } from 'src/domain/songs/songs.service';
import { Entity, EntityProps } from 'src/domain/types/entity';

const requiredKey = ['id', 'username', 'ticket', 'ticketPiece', 'viasIdolIds'] as const;
const optionalKey = ['twitchId', 'prefix'] as const;

const constructorKey = [...requiredKey, ...optionalKey] as const;
export type ViewerProps = EntityProps<Viewer, typeof requiredKey, typeof optionalKey>;

export class Viewer extends Entity {
  public readonly id!: number;
  public readonly twitchId?: string;
  public readonly username!: string;
  public readonly ticket!: number;
  public readonly ticketPiece!: number;
  public readonly prefix?: string;
  public readonly viasIdolIds!: number[];

  constructor(props: ViewerProps) {
    super(props, constructorKey);
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
      id: -1,
      title,
      requestorId: this.id,
      requestType,
    });
  }

  private getRequestType(isFreemode: boolean) {
    if (isFreemode) return RequestType.freemode;
    if (this.ticket > 0) return RequestType.ticket;

    return RequestType.ticketPiece;
  }
}
