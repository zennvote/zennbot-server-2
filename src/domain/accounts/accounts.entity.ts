import { BusinessError } from 'src/util/business-error';
import { Entity, EntityProps } from 'src/domain/types/entity';

const requiredKey = ['id', 'username', 'ticket', 'ticketPiece'] as const;
const optionalKey = ['twitchId', 'prefix'] as const;

const constructorKey = [...requiredKey, ...optionalKey] as const;
export type AccountProps = EntityProps<Account, typeof constructorKey>;

export class Account extends Entity {
  public readonly id!: number;
  public readonly twitchId?: string;
  public readonly username!: string;
  public readonly ticket!: number;
  public readonly ticketPiece!: number;
  public readonly prefix?: string;

  constructor(props: AccountProps) {
    super(props, constructorKey);
  }

  public payForRequestSong() {
    if (this.ticket < 1 && this.ticketPiece < 3) return new BusinessError('not-enough-point');

    if (this.ticket > 0) {
      this.mutable.ticket -= 1;
      return 'ticket';
    }

    this.mutable.ticketPiece -= 3;
    return 'ticketPiece';
  }
}
