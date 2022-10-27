import { Injectable } from '@nestjs/common';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import { SettingsRepository } from 'src/infrastructure/persistence/settings/settings.repository';
import { SongsRepository } from 'src/infrastructure/persistence/songs/songs.repository';
import { ViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.repository';

import * as Settings from 'src/domain/settings/settings-store';
import { SettingsService } from 'src/domain/settings/settings.service';
import { SongsService } from 'src/domain/songs/songs.service';

@Injectable()
export class SongsApplication {
  private readonly songsService: SongsService;
  private readonly settingsService: SettingsService;

  constructor(
    private readonly viewersRepository: ViewersRepository,
    private readonly songsRepository: SongsRepository,
    settingsRepository: SettingsRepository,
  ) {
    this.songsService = new SongsService(songsRepository);
    this.settingsService = new SettingsService(settingsRepository);
  }

  public async requestSong(twitchId: string, username: string, title: string) {
    const isRequestEnabled = await this.settingsService.getSetting(Settings.IsRequestEnabled);
    if (!isRequestEnabled) return new BusinessError('request-not-enabled');

    const viewer = await this.viewersRepository.findOne(twitchId, username);
    if (viewer === null) return new BusinessError('no-viewer');

    const isGoldenbellEnabled = await this.settingsService.getSetting(Settings.IsGoldenbellEnabled);

    const song = await viewer.requestSong(title, isGoldenbellEnabled, this.songsService);
    if (isBusinessError(song)) return song;

    const [persisted] = await Promise.all([
      await this.songsRepository.save(song),
      await this.viewersRepository.save(viewer),
    ]);

    return persisted;
  }
}
