import { BusinessError } from 'src/util/business-error';

import { Entity } from 'src/domain/types/entity';

export enum RequestType {
  ticket = '티켓',
  ticketPiece = '조각',
  freemode = '골든벨',
  manual = 'manual',
}

export type SongProps = {
  id: string;
  title: string;
  consumed?: boolean;
  requestorName: string;
  requestType: RequestType;
};

export class Song extends Entity {
  public readonly title: string;
  public readonly consumed: boolean;
  public readonly requestorName: string;
  public readonly requestType: RequestType;

  constructor(props: SongProps) {
    super(props.id);

    this.title = props.title;
    this.consumed = props.consumed ?? false;
    this.requestorName = props.requestorName;
    this.requestType = props.requestType;
  }
}
