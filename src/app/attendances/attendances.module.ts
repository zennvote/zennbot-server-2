import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancesService } from './attendances.service';
import { AttendanceDataModel } from './repositories/attendance.datamodel';
import { AttendancesRepository } from './repositories/attendances.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceDataModel])],
  providers: [AttendancesService, AttendancesRepository],
})
export class AttendancesModule {}
