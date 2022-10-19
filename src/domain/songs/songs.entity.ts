import { Entity, EntityProps } from 'src/domain/types/entity';
import { BusinessError } from 'src/util/business-error';

export enum RequestType {
  ticket = '티켓',
  ticketPiece = '조각',
  freemode = '골든벨',
  manual = 'manual',
}

const requiredKey = ['id', 'title', 'requestorId', 'requestType'] as const;
const optionalKey = ['consumed'] as const;
const constructorKey = [...requiredKey, ...optionalKey] as const;
export type SongProps = EntityProps<Song, typeof requiredKey, typeof optionalKey>;

export class Song extends Entity {
  public readonly id!: number;
  public readonly title!: string;
  public readonly consumed!: boolean;
  public readonly requestorId!: number;
  public readonly requestType!: RequestType;

  constructor(props: SongProps) {
    super({ consumed: false, ...props }, constructorKey);
  }

  consume() {
    if (this.consumed === true) {
      return new BusinessError('already-consumed');
    }
    this.mutable.consumed = true;
  }
}
