import { ApiProperty } from '@nestjs/swagger';

export enum RequestType {
  ticket = '티켓',
  ticketPiece = '조각',
  freemode = '골든벨',
  manual = 'manual',
}

export default class Song {
  @ApiProperty()
  title: string;

  @ApiProperty()
  requestor: string;

  @ApiProperty()
  requestorName: string;

  @ApiProperty({ enum: RequestType })
  requestType: RequestType;

  constructor(title: string, requestor: string, requestorName: string, requestType: RequestType) {
    this.title = title;
    this.requestor = requestor;
    this.requestorName = requestorName;
    this.requestType = requestType;
  }
}
