export interface ViewerInitializer {
  index: number;
  username: string;
  twitchId?: string;
  ticket: number;
  ticketPiece: number;
  prefix?: string;
}

export class Viewer {
  index: number;
  username: string;
  twitchId?: string;
  ticket: number;
  ticketPiece: number;
  prefix?: string;

  constructor(initializer?: ViewerInitializer) {
    this.index = initializer?.index;
    this.username = initializer?.username;
    this.twitchId = initializer?.twitchId;
    this.ticket = initializer?.ticket;
    this.ticketPiece = initializer?.ticketPiece;
    this.prefix = initializer?.prefix;
  }
}
