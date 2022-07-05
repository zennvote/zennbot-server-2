import { Injectable } from '@nestjs/common';
import { SettingsService } from 'src/domain/settings/settings.service';

import { BusinessError, isBusinessError } from 'src/util/business-error';
import { ViewersService } from 'src/domain/viewers/viewers.service';

import { RequestType } from './songs.entity';
import { SongsService } from './songs.service';

@Injectable()
export class SongsApplication {
  constructor(
    private readonly songsService: SongsService,
    private readonly viewersService: ViewersService,
    private readonly settingsService: SettingsService,
  ) {}

  async getSongs() {
    return await this.songsService.getSongs();
  }

  getSongsObserver() {
    return this.songsService.requestedSongsObserver;
  }

  async requestSong(title: string, twitchId: string, username: string) {
    const isRequestEnabled = (await this.settingsService.getSetting('request-enabled'))?.value ?? false;
    if (!isRequestEnabled) {
      return new BusinessError('request-disabled');
    }

    const viewer = await this.viewersService.getViewer(twitchId, username);
    if (!viewer) {
      return new BusinessError('viewer-not-exists');
    }

    const isCooltime = await this.songsService.isCooltime(twitchId);
    if (isCooltime) {
      return new BusinessError('in-cooltime');
    }

    const isGoldenbellEnabled = (await this.settingsService.getSetting('goldenbell-enabled'))?.value ?? false;
    let requestType = isGoldenbellEnabled ? RequestType.freemode : undefined;

    if (!requestType) {
      const result = await this.viewersService.payForSongRequest(viewer);
      if (isBusinessError(result)) {
        return result;
      }
      requestType = result;
    }

    return await this.songsService.enqueueSong({
      title,
      requestor: twitchId,
      requestorName: username,
      requestType,
    });
  }

  async createSongManually(title: string) {
    return await this.songsService.enqueueSong({
      title,
      requestor: 'producerzenn',
      requestorName: '프로듀서_젠',
      requestType: RequestType.manual,
    });
  }

  async deleteSong(index: number, isRefund: boolean) {
    if (index < 0) {
      return new BusinessError('out-of-range');
    }

    const deleted = await this.songsService.deleteSong(index);
    if (isBusinessError(deleted)) {
      return deleted;
    }

    if (isRefund && (deleted.requestType === RequestType.ticket || deleted.requestType === RequestType.ticketPiece)) {
      const result = await this.viewersService.refundPoints(deleted.requestor, deleted.requestType);

      if (isBusinessError(result)) {
        return result;
      }
    }

    return deleted;
  }

  async skipSong() {
    return await this.songsService.skipSong();
  }

  async reindexSongs(indexes: number[]) {
    return await this.songsService.reindexSong(indexes);
  }

  async resetRequestedSongs() {
    return await this.songsService.resetRequestedSongs();
  }

  async getCooltimeSongs() {
    return await this.songsService.getCooltimeSongs();
  }

  async resetCooltimeSongs() {
    return await this.songsService.resetCooltimeSongs();
  }
}
