import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AxiosError } from 'axios';

import { MainLogger } from 'src/util/logger';
import * as twitch from 'src/util/twitch';

@Injectable()
export class AttendancesTaskService {
  private readonly logger = new MainLogger(AttendancesTaskService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkSubscriptionApi() {
    this.logger.log('Check twitch subscription api');

    const channel = this.configService.get('TMI_CHANNEL');
    const channelId = this.configService.get('TMI_CHANNEL_ID');

    try {
      const subscription = await twitch.getSubscription(channel, channelId, 'producerzenn');
      if (subscription !== 1 && subscription !== 2 && subscription !== 3) {
        this.logger.error(`twitch subscription api returned invalid value: ${subscription}`);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`twitch subscription api failed on fetch witch status: ${error.status}`);
        this.logger.error(error.response?.data);

        return;
      }
      this.logger.error('twitch subscription api failed with unknown error');
      this.logger.error(error);
    }
  }
}
