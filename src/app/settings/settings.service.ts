import { Injectable } from '@nestjs/common';

import { SettingsRepository } from './settings.repository';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getSetting(key: string) {
    return this.settingsRepository.getSetting(key);
  }

  async updateSetting(key: string, value: boolean) {
    return this.settingsRepository.setFlagSetting(key, value);
  }
}
