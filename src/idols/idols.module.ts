import { Module } from '@nestjs/common';
import { SheetsModule } from 'src/sheets/sheets.module';
import { IdolsRepository } from './idols.repository';

@Module({
  providers: [IdolsRepository],
  imports: [SheetsModule],
})
export class IdolsModule {}
