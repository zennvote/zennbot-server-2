import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

import { Attendance } from '../entities/attendance.entity';
import { AttendanceDataModel } from './attendance.datamodel';

@Injectable()
export class AttendancesRepository {
  constructor(
    @InjectRepository(AttendanceDataModel) private attendanceDataModelRepository: Repository<AttendanceDataModel>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getRecentAttendance(twitchId: string): Promise<Attendance | null> {
    const cacheKey = `cache.getRecentAttendance.${twitchId}`;
    const cached = await this.cacheManager.get<Attendance | 'null'>(cacheKey);

    if (cached === 'null') {
      return null;
    } else if (cached) {
      const attendance = new Attendance();
      attendance.twitchId = cached.twitchId;
      attendance.attendedAt = cached.attendedAt;
      attendance.tier = cached.tier;

      return attendance;
    }

    const result = await this.attendanceDataModelRepository.findOne({
      where: { twitchId },
      order: { attendedAt: 'DESC' },
    });

    await this.cacheManager.set(cacheKey, result ?? 'null', { ttl: 12 * 60 * 60 });

    if (!result) {
      return null;
    }

    const attendance = new Attendance();
    attendance.twitchId = result.twitchId;
    attendance.attendedAt = result.attendedAt;
    attendance.tier = result.tier;

    return attendance;
  }

  async saveAttendance(attendance: Attendance): Promise<Attendance> {
    const created = await this.attendanceDataModelRepository.save({
      twitchId: attendance.twitchId,
      attendedAt: attendance.attendedAt,
      tier: attendance.tier,
    });

    await this.cacheManager.del(`cache.getRecentAttendance.${attendance.twitchId}`);

    const createdAttendance = new Attendance();
    createdAttendance.twitchId = created.twitchId;
    createdAttendance.attendedAt = created.attendedAt;
    createdAttendance.tier = created.tier;

    return createdAttendance;
  }
}
