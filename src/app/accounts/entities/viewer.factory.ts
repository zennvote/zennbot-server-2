import { Factory } from 'fishery';

import { Viewer } from '../viewers.entity';

class ViewerFactory extends Factory<Viewer> {
  indexed(index: number) {
    return this.params({ index });
  }

  withPrefix(prefix = 'test prefix') {
    return this.params({ prefix });
  }
}

export const viewerFactory = ViewerFactory.define(
  ({ sequence, params }) => {
    const index = params.index ?? sequence;

    return new Viewer({
      index,
      ticket: 10,
      ticketPiece: 17,
      username: `테스트시청자${index}`,
      twitchId: `testviewer${index}`,
      ...params,
    });
  },
);
