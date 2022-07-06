import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manager } from './managers.entity';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Manager])],
  providers: [ManagersService],
  exports: [ManagersService],
  controllers: [ManagersController],
})
export class ManagerModule {}
