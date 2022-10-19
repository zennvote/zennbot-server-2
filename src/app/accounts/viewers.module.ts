import { Module } from '@nestjs/common';

import { ViewersController } from './viewers.controller';
import { ViewersRepository } from './viewers.repository';
import { ViewersService } from './viewers.service';

@Module({
  providers: [ViewersService, ViewersRepository],
  controllers: [ViewersController],
  exports: [ViewersService, ViewersRepository],
})
export class ViewersModule {}
