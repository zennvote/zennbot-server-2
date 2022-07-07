import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewersModule } from '../viewers/viewers.module';
import { AttendancesApplication } from './attendances.application';
import { AttendancesService } from './attendances.service';
import { AttendanceDataModel } from './repositories/attendance.datamodel';
import { AttendancesRepository } from './repositories/attendances.repository';
import { AttendancesController } from './attendances.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceDataModel]), CacheModule.register(), ViewersModule],
  providers: [AttendancesService, AttendancesRepository, AttendancesApplication],
  controllers: [AttendancesController],
})
export class AttendancesModule {}
