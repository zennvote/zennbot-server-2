export interface ViewerInitializer {
  username: string;
  twitchId?: string;
  ticket: number;
  ticketPiece: number;
  prefix?: string;
}

export class Viewer {
  username: string;
  twitchId?: string;
  ticket: number;
  ticketPiece: number;
  prefix?: string;

  constructor(initializer?: ViewerInitializer) {
    this.username = initializer?.username;
    this.twitchId = initializer?.twitchId;
    this.ticket = initializer?.ticket;
    this.ticketPiece = initializer?.ticketPiece;
    this.prefix = initializer?.prefix;
  }
}
