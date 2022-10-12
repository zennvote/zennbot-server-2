import { BusinessError } from 'src/util/business-error';
import { Entity, EntityProps } from 'src/domain/types/entity';

import { SongsService } from 'src/domain/songs/songs.service';
import { RequestType, Song } from 'src/domain/songs/songs.entity';

const requiredKey = ['id', 'twitchId', 'username', 'accountId'] as const;
const optionalKey = [] as const;

const constructorKey = [...requiredKey, ...optionalKey] as const;
export type ViewerProps = EntityProps<Viewer, typeof constructorKey>;

export class Viewer extends Entity {
  public readonly id!: number;
  public readonly twitchId!: string;
  public readonly username!: string;
  public readonly accountId!: number;

  constructor(props: ViewerProps) {
    super(props, constructorKey);
  }

  public async requestSong(title: string, requestType: RequestType, songsService: SongsService) {
    const isInCooltime = await songsService.isViewerInCooltime(this);
    if (isInCooltime) return new BusinessError('in-cooltime');

    return new Song({
      id: -1,
      title,
      requestorId: this.id,
      requestType,
    });
  }
}
