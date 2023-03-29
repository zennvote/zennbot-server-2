import { Module } from '@nestjs/common';

import { ViewersModule } from 'src/app/accounts/viewers.module';

import { AttendancesApplication } from './attendances.application';
import { AttendancesController } from './attendances.controller';
import { AttendancesTaskService } from './attendances.cron';
import { AttendancesRepository } from './repositories/attendances.repository';

@Module({
  imports: [ViewersModule],
  providers: [AttendancesRepository, AttendancesApplication, AttendancesTaskService],
  controllers: [AttendancesController],
})
export class AttendancesModule {}
