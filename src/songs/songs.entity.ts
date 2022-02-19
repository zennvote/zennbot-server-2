export enum RequestType {
  ticket = '티켓',
  ticketPiece = '조각',
  freemode = '골든벨',
  manual = 'manual',
}

export default class Song {
  constructor(
    public title: string,
    public requestor: string,
    public requestorName: string,
    public requestType: RequestType,
  ) {}
}
