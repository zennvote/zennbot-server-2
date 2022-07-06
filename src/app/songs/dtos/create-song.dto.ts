import { RequestType } from '../songs.entity';

export class CreateSongDto {
  title!: string;
  requestor!: string;
  requestorName!: string;
  requestType!: RequestType;
}
