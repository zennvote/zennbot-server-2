import { randomUUID } from 'crypto';

import { Factory } from 'fishery';

import { RequestType, Song, SongProps } from './entities/songs.entity';

export const songFactory = Factory.define<SongProps, Record<string, never>, Song>(
  ({ params, sequence, onCreate }) => {
    onCreate((props) => new Song(props));

    return {
      id: randomUUID(),
      title: `test song ${sequence}`,
      requestorId: randomUUID(),
      requestType: RequestType.manual,
      ...params,
    };
  },
);
