import { Factory } from 'fishery';

import { Viewer, ViewerProps } from 'src/domain/viewers/viewers.entity';

export const viewerFactory = Factory.define<ViewerProps, Record<string, never>, Viewer>(
  ({ params, sequence, onCreate }) => {
    onCreate((props) => new Viewer(props));

    return {
      id: sequence,
      accountId: -1,
      twitchId: `테스트시청자${sequence}`,
      username: `testviewer${sequence}`,
      ...params,
    };
  },
);
