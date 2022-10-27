import { Module } from '@nestjs/common';

import { IdolsApplication } from 'src/application/idols/idols.application';

import { IdolsController } from './idols.controller';

@Module({
  controllers: [IdolsController],
  providers: [IdolsApplication],
})
export class IdolsModule {}
