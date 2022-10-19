import { Module } from '@nestjs/common';

import { ViewersModule } from 'src/app/accounts/viewers.module';

import { AttendancesApplication } from './attendances.application';
import { AttendancesController } from './attendances.controller';
import { AttendancesRepository } from './repositories/attendances.repository';

@Module({
  imports: [ViewersModule],
  providers: [AttendancesRepository, AttendancesApplication],
  controllers: [AttendancesController],
})
export class AttendancesModule {}
