import { ApiProperty } from '@nestjs/swagger';

export interface ViewerInitializer {
  index: number;
  username: string;
  twitchId?: string;
  ticket: number;
  ticketPiece: number;
  prefix?: string;
}

export class Viewer {
  @ApiProperty()
  index!: number;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  twitchId?: string;

  @ApiProperty()
  ticket!: number;

  @ApiProperty()
  ticketPiece!: number;

  @ApiProperty({ nullable: true })
  prefix?: string;

  constructor(initializer?: ViewerInitializer) {
    if (initializer) {
      this.index = initializer.index;
      this.username = initializer.username;
      this.twitchId = initializer.twitchId;
      this.ticket = initializer.ticket;
      this.ticketPiece = initializer.ticketPiece;
      this.prefix = initializer.prefix;
    }
  }
}
