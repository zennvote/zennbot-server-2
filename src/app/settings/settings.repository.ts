import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { SettingType } from './entities/setting.datamodel';
import { FlagSetting } from './entities/setting.entity';

@Injectable()
export class SettingsRepository {
  constructor(private prisma: PrismaService) { }

  async getSetting(key: string) {
    const result = await this.prisma.setting.findFirst({ where: { key } });

    if (!result) {
      return null;
    }

    switch (result.type) {
      case SettingType.Flag:
        const flagSetting = new FlagSetting();
        flagSetting.key = result.key;
        flagSetting.value = result.flagValue ?? false;
        return flagSetting;
      default:
        return null;
    }
  }

  async setFlagSetting(key: string, value: boolean) {
    const result = await this.prisma.setting.update({ where: { key }, data: { flagValue: value } });

    return result.flagValue === value;
  }
}
