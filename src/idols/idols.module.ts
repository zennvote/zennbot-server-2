import { Module } from '@nestjs/common';
import { SheetsModule } from 'src/sheets/sheets.module';
import { IdolsRepository } from './idols.repository';
import { IdolsService } from './idols.service';
import { IdolsController } from './idols.controller';
import { IdolsApplication } from './idols.application';

@Module({
  providers: [IdolsRepository, IdolsService, IdolsApplication],
  imports: [SheetsModule],
  controllers: [IdolsController],
})
export class IdolsModule {}
