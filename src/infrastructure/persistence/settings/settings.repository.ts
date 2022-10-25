import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { SettingTypeMap } from 'src/domain/settings/settings-store';
import { SettingsRepository as SettingsRepositoryInterface } from 'src/domain/settings/settings.repository';

@Injectable()
export class SettingsRepository implements SettingsRepositoryInterface {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getSetting<Key extends keyof SettingTypeMap>(key: Key): Promise<SettingTypeMap[Key]> {
    const result = await this.prisma.setting.findUnique({ where: { key } });

    return result?.flagValue ?? false;
  }
}
