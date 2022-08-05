import { Module } from '@nestjs/common';
import { ViewersModule } from '../viewers/viewers.module';
import { AttendancesApplication } from './attendances.application';
import { AttendancesRepository } from './repositories/attendances.repository';
import { AttendancesController } from './attendances.controller';

@Module({
  imports: [ViewersModule],
  providers: [AttendancesRepository, AttendancesApplication],
  controllers: [AttendancesController],
})
export class AttendancesModule {}
