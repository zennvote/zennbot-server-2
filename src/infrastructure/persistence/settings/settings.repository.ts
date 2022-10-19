import { SettingTypeMap } from 'src/domain/settings/settings-store';
import { SettingsRepository as SettingsRepositoryInterface } from 'src/domain/settings/settings.repository';

export class SettingsRepository implements SettingsRepositoryInterface {
  getSetting<Key extends keyof SettingTypeMap>(key: Key): Promise<SettingTypeMap[Key]> {
    throw new Error('Method not implemented.');
  }
}
