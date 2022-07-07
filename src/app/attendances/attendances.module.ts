import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewersModule } from '../viewers/viewers.module';
import { AttendancesApplication } from './attendances.application';
import { AttendancesService } from './attendances.service';
import { AttendanceDataModel } from './repositories/attendance.datamodel';
import { AttendancesRepository } from './repositories/attendances.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceDataModel]), ViewersModule],
  providers: [AttendancesService, AttendancesRepository, AttendancesApplication],
})
export class AttendancesModule {}
