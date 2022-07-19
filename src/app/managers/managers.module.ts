import { Global, Module } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';

@Global()
@Module({
  providers: [ManagersService],
  exports: [ManagersService],
  controllers: [ManagersController],
})
export class ManagerModule {}
