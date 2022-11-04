import { Module } from '@nestjs/common';

import { ViewersApplication } from 'src/application/viewers/viewers.application';

import { ViewersController } from './viewers.controller';

@Module({
  controllers: [ViewersController],
  providers: [ViewersApplication],
})
export class ViewersModule {}
