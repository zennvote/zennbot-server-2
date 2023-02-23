import { Factory } from 'fishery';

import { RequestType, Song, SongProps } from './entities/songs.entity';

export const songFactory = Factory.define<SongProps, Record<string, never>, Song>(
  ({ params, sequence, onCreate }) => {
    onCreate((props) => new Song(props));

    return {
      id: sequence,
      title: `test song ${sequence}`,
      requestorId: -1,
      requestType: RequestType.manual,
      ...params,
    };
  },
);
