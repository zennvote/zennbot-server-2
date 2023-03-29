import { randomUUID } from 'crypto';

import { Factory } from 'fishery';

import { SongQueue, SongQueueProps } from './entities/song-queue.entity';
import { SongRequestor, SongRequestorProps } from './entities/song-requestor.entity';
import { RequestType, Song, SongProps } from './entities/songs.entity';

type Blank = Record<string, never>;

export const songFactory = Factory.define<SongProps, Blank, Song>(
  ({ params, sequence, onCreate }) => {
    onCreate((props) => new Song(props));

    return {
      id: randomUUID(),
      title: `test song ${sequence}`,
      requestorName: `testuser${sequence}`,
      requestType: RequestType.manual,
      ...params,
    };
  },
);

export const songQueueFactory = Factory.define<SongQueueProps, Blank, SongQueue>(
  ({ params, onCreate }) => {
    onCreate((props) => new SongQueue(props));

    return {
      id: randomUUID(),
      requestedSongs: [],
      consumedSongs: [],
      isRequestEnabled: true,
      isGoldenBellEnabled: false,
      ...params,
    };
  },
);

export const songRequestorFactory = Factory.define<SongRequestorProps, Blank, SongRequestor>(
  ({ params, sequence, onCreate }) => {
    onCreate((props) => new SongRequestor(props));

    return {
      id: randomUUID(),
      twitchId: `testuser${sequence}`,
      username: `유저 ${sequence}`,
      ticket: 0,
      ticketPiece: 0,
      ...params,
    };
  },
);
