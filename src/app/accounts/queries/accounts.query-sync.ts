import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountsRepository } from '../accounts.repository';
import { AccountQuery } from './accounts.query';

@Injectable()
export class AccountQuerySync {
  private readonly logger = new Logger(AccountQuerySync.name);

  constructor(
    private readonly query: AccountQuery,
    private readonly repository: AccountsRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncQuery() {
    this.logger.log('sync start');

    const original = await this.repository.findAll();
    const originalProperties = original.map((original) => original.properties);

    const { created, updated } = await this.query.syncAll(originalProperties);

    this.logger.log(`sync finished : created ${created}, updated ${updated}`);
  }
}
