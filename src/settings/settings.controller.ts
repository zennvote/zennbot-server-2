import { Body, Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
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

  @Patch(':key')
  @ApiOkResponse()
  async updateSetting(@Param('key') key: string, @Body('value') value: boolean) {
    return this.settingsService.updateSetting(key, value);
  }
}
