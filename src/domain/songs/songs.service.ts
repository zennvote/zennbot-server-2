import { Viewer } from 'src/domain/viewers/viewers.entity';
import { SongsRepository } from 'src/domain/songs/songs.repository';

export class SongsService {
  constructor(private readonly songsRepository: SongsRepository) {}

  public async isViewerInCooltime(viewer: Viewer): Promise<boolean> {
    const cooltimeSongs = await this.songsRepository.getCooltimeSongs();
    const requestedSongs = await this.songsRepository.getRequestedSongs();

    return [...cooltimeSongs, ...requestedSongs]
      .slice(-4)
      .some((song) => song.requestorId === viewer.id);
  }
}
