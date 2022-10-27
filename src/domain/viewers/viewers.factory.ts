import { Factory } from 'fishery';

import { Viewer, ViewerProps } from './viewers.entity';

export const viewerFactory = Factory.define<ViewerProps, Record<string, never>, Viewer>(
  ({ params, sequence, onCreate }) => {
    onCreate((props) => new Viewer(props));

    return {
      id: sequence,
      twitchId: `테스트시청자${sequence}`,
      username: `testviewer${sequence}`,
      ticket: 0,
      ticketPiece: 0,
      viasIdolIds: [],
      ...params,
    };
  },
);
