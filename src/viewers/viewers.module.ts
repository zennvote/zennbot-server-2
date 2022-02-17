import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewersController } from './viewers.controller';
import { Viewer } from './viewers.entity';
import { ViewersService } from './viewers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Viewer])],
  providers: [ViewersService],
  controllers: [ViewersController],
})
export class ViewersModule {}
