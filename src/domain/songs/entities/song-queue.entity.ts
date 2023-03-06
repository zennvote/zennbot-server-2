import { randomUUID } from 'crypto';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import { Entity } from 'src/domain/types/entity';

import { SongRequestor } from './song-requestor.entity';
import { RequestType, Song } from './songs.entity';

export type SongQueueProps = {
  id: string;
  requestedSongs: Song[];
  consumedSongs: Song[];
  isRequestEnabled: boolean;
  isGoldenBellEnabled: boolean
};

export class SongQueue extends Entity {
  public readonly requestedSongs: Song[];
  public readonly consumedSongs: Song[];
  public readonly isRequestEnabled: boolean;
  public readonly isGoldenBellEnabled: boolean;

  constructor(props: SongQueueProps) {
    super(props.id);

    this.requestedSongs = props.requestedSongs;
    this.consumedSongs = props.consumedSongs;
    this.isRequestEnabled = props.isRequestEnabled;
    this.isGoldenBellEnabled = props.isGoldenBellEnabled;
  }

  consume() {
    const consumed = this.requestedSongs.shift();
    if (!consumed) return new BusinessError('empty-queue');

    this.consumedSongs.push(consumed);
    if (this.consumedSongs.length > 4) {
      this.consumedSongs.shift();
    }

    return consumed;
  }

  request(title: string, requestor: SongRequestor) {
    if (this.isRequestEnabled === false) return new BusinessError('request-disabled');

    const isInCooltime = this.consumedSongs.some((song) => song.requestorName === requestor.username);
    if (isInCooltime) return new BusinessError('in-cooltime');

    const requestType = this.payForRequestAndGetRequestType(requestor);
    if (isBusinessError(requestType)) return requestType;

    const song = new Song({
      id: randomUUID(),
      title,
      requestorId: requestor.username,
      requestType,
    });

    this.requestedSongs.push(song);

    return song;
  }

  private payForRequestAndGetRequestType(requestor: SongRequestor) {
    if (this.isGoldenBellEnabled) return RequestType.freemode;

    const payment = requestor.payForRequest();
    if (isBusinessError(payment)) return payment;

    return payment;
  }
}
