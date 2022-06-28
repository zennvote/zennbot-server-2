import { Module } from '@nestjs/common';
import { SheetsModule } from 'src/sheets/sheets.module';
import { IdolsRepository } from './idols.repository';
import { IdolsService } from './idols.service';

@Module({
  providers: [IdolsRepository, IdolsService],
  imports: [SheetsModule],
})
export class IdolsModule {}
