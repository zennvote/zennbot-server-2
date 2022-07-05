import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SheetsModule } from 'src/libs/sheets/sheets.module';
import { IdolsRepository } from './idols.repository';
import { IdolsService } from './idols.service';
import { IdolsController } from './idols.controller';
import { IdolsApplication } from './idols.application';

@Module({
  providers: [IdolsRepository, IdolsService, IdolsApplication],
  imports: [SheetsModule, ConfigModule],
  controllers: [IdolsController],
})
export class IdolsModule {}
