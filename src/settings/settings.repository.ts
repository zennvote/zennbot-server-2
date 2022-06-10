import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SettingDataModel, SettingType } from './entities/setting.datamodel';
import { FlagSetting } from './entities/setting.entity';

@Injectable()
export class SettingsRepository {
  constructor(private readonly settingsDataModelRepository: Repository<SettingDataModel>) {}

  async getSetting(key: string) {
    const result = await this.settingsDataModelRepository.findOne({ where: { key } });

    if (!result) {
      return null;
    }

    switch (result.type) {
      case SettingType.Flag:
        const flagSetting = new FlagSetting();
        flagSetting.key = result.key;
        flagSetting.value = result.flagValue;
        return flagSetting;
    }
  }
}
