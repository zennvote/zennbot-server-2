import { Module } from '@nestjs/common';

import { ViewersApplication } from 'src/application/viewers/viewers.application';

import { ViewersController } from './viewers.controller';

@Module({
  providers: [ViewersController, ViewersApplication],
})
export class ViewersModule {}
