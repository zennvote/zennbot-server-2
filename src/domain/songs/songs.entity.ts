import { Entity, EntityProps } from 'src/domain/types/entity';

export enum RequestType {
  ticket = '티켓',
  ticketPiece = '조각',
  freemode = '골든벨',
  manual = 'manual',
}

const constructorKey = ['id', 'title', 'requestorId', 'requestType'] as const;
export type SongProps = EntityProps<Song, typeof constructorKey>;

export class Song extends Entity {
  public readonly id!: number;
  public readonly title!: string;
  public readonly requestorId!: number;
  public readonly requestType!: RequestType;

  constructor(props: SongProps) {
    super(props, constructorKey);
  }
}
