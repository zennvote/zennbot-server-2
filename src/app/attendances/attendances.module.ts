import { CacheModule, Module } from '@nestjs/common';
import { ViewersModule } from '../viewers/viewers.module';
import { AttendancesApplication } from './attendances.application';
import { AttendancesService } from './attendances.service';
import { AttendancesRepository } from './repositories/attendances.repository';
import { AttendancesController } from './attendances.controller';

@Module({
  imports: [CacheModule.register(), ViewersModule],
  providers: [AttendancesService, AttendancesRepository, AttendancesApplication],
  controllers: [AttendancesController],
})
export class AttendancesModule {}
