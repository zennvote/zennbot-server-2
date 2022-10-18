import { SettingTypeMap } from './settings-store';

export interface SettingsRepository {
  getSetting<Key extends keyof SettingTypeMap>(key: Key): Promise<SettingTypeMap[Key]>
  setSetting<Key extends keyof SettingTypeMap>(
    key: Key,
    value: SettingTypeMap[Key]
  ): Promise<SettingTypeMap[Key]>
}
