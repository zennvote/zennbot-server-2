import { SettingTypeMap } from './settings-store';
import { SettingsRepository } from './settings.repository';

export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  public async getSetting<Key extends keyof SettingTypeMap>(
    key: Key,
  ): Promise<SettingTypeMap[Key]> {
    return this.settingsRepository.getSetting(key);
  }
}
