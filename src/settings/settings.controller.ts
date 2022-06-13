import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Setting } from './entities/setting.entity';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':key')
  @ApiOkResponse({ type: Setting })
  async getSetting(@Param('key') key: string) {
    const setting = await this.settingsService.getSetting(key);
    if (!setting) {
      throw new NotFoundException();
    }

    return setting;
  }
}
