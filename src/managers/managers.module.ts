import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manager } from './managers.entity';
import { ManagersService } from './managers.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Manager])],
  providers: [ManagersService],
  exports: [ManagersService],
})
export class ManagerModule {}
