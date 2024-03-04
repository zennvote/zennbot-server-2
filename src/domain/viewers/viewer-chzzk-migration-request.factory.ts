import { Factory } from 'fishery';

import { ViewerChzzkMigrationRequest, ViewerChzzkMigrationRequestProps } from './viewer-chzzk-migration-request.entity';

export const viewerChzzkMigrationRequestFactory =
  Factory.define<ViewerChzzkMigrationRequestProps, Record<string, never>, ViewerChzzkMigrationRequest>(
    ({ params, sequence, onCreate }) => {
      onCreate((props) => new ViewerChzzkMigrationRequest(props));

      return {
        id: `${sequence}`,
        twitchId: `testviewer${sequence}`,
        twitchUsername: `테스트시청자${sequence}`,
        chzzkId: `chzzk${sequence.toString(16).padStart(16, '0')}`,
        chzzkUsername: `치지직시청자${sequence}`,
        ...params,
      };
    },
  );
