import { SinonSandbox } from 'sinon';
import { SettingTypeMap } from 'src/domain/settings/settings-store';
import { SettingsRepository } from 'src/domain/settings/settings.repository';

export class MockSettingsRepository implements SettingsRepository {
  constructor(public readonly sinon: SinonSandbox) {}

  public MockSettings: SettingTypeMap = {
    'request-enabled': true,
    'goldedbell-enabled': false,
  };

  public getSetting = this.sinon.fake(async (key) => this.MockSettings[key]);
  public setSetting = this.sinon.fake(async (key, value) => value);
}
