import { Injectable } from '@nestjs/common';
import { BusinessError, isBusinessError } from 'src/util/business-error';

import { AccountsRepository } from 'src/infrastructure/persistence/accounts/accounts.repository';
import { SongsRepository } from 'src/infrastructure/persistence/songs/songs.repository';
import { ViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.repository';

import * as Settings from 'src/domain/settings/settings-store';
import { SongsService } from 'src/domain/songs/songs.service';
import { RequestType } from 'src/domain/songs/songs.entity';
import { SettingsRepository } from 'src/infrastructure/persistence/settings/settings.repository';
import { SettingsService } from 'src/domain/settings/settings.service';

@Injectable()
export class SongsApplication {
  private readonly songsService: SongsService;
  private readonly settingsService: SettingsService;

  constructor(
    private readonly viewersRepository: ViewersRepository,
    private readonly accountsRepository: AccountsRepository,
    private readonly songsRepository: SongsRepository,
    settingsRepository: SettingsRepository,
  ) {
    this.songsService = new SongsService(songsRepository);
    this.settingsService = new SettingsService(settingsRepository);
  }

  public async requestSong(twitchId: string, username: string, title: string) {
    const isRequestEnabled = await this.settingsService.getSetting(Settings.IsRequestEnabled);
    if (!isRequestEnabled) return new BusinessError('request-not-enabled');

    const viewer = await this.viewersRepository.findOne(twitchId);
    if (viewer === null) return new BusinessError('no-viewer');

    const account = await this.accountsRepository.findByTwitchIdAndUsername(twitchId, username);
    if (account === null) return new BusinessError('no-account');

    const isGoldenbellEnabled = await this.settingsService.getSetting(Settings.IsGoldenbellEnabled);

    const paymentResult = isGoldenbellEnabled ? null : account.payForRequestSong();
    if (isBusinessError(paymentResult)) return paymentResult;

    const requestType = await this.getRequestType(paymentResult, isGoldenbellEnabled);
    const song = await viewer.requestSong(title, requestType, this.songsService);
    if (isBusinessError(song)) return song;

    const [persisted] = await Promise.all([
      await this.songsRepository.save(song),
      await this.accountsRepository.save(account),
    ]);

    return persisted;
  }

  private async getRequestType(paymentResult: 'ticket' | 'ticketPiece' | null, isGoldenbellEnabled: boolean) {
    if (isGoldenbellEnabled) return RequestType.freemode;
    if (paymentResult === 'ticket') return RequestType.ticket;
    if (paymentResult === 'ticketPiece') return RequestType.ticketPiece;
    /* c8 ignore next 4 */
    /* ignore logically unreachable code */

    throw new Error('invalid payment result');
  }
}
