import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Attendance as PrismaAttendance } from '@prisma/client';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { Attendance } from '../entities/attendance.entity';

@Injectable()
export class AttendancesRepository {
  constructor(private prisma: PrismaService, @Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  async getRecentAttendance(twitchId: string): Promise<Attendance | null> {
    const cacheKey = `cache.getRecentAttendance.${twitchId}`;
    const cached = await this.cacheManager.get<Attendance | 'null'>(cacheKey);

    if (cached === 'null') {
      return null;
    } if (cached) {
      const attendance = new Attendance();
      attendance.twitchId = cached.twitchId;
      attendance.attendedAt = cached.attendedAt;
      attendance.tier = cached.tier;

      return attendance;
    }

    const result = await this.prisma.attendance.findFirst({
      where: { twitchId },
      orderBy: { attendedAt: 'desc' },
    });

    await this.cacheManager.set(cacheKey, result ?? 'null', { ttl: 12 * 60 * 60 });

    if (!result) {
      return null;
    }

    const attendance = AttendancesRepository.convertDataModel(result);

    return attendance;
  }

  async getAttendances(): Promise<Attendance[]> {
    const result = await this.prisma.attendance.findMany({
      orderBy: [{ broadcastedAt: 'desc' }, { attendedAt: 'desc' }],
    });

    const attendances = result.map(AttendancesRepository.convertDataModel);

    return attendances;
  }

  async getAttendancesByBroadcastedAt(broadcastedAt: string) {
    const result = await this.prisma.attendance.findMany({
      where: { broadcastedAt },
      orderBy: { attendedAt: 'desc' },
    });

    const attendances = result.map(AttendancesRepository.convertDataModel);

    return attendances;
  }

  async saveAttendance(attendance: Attendance): Promise<Attendance> {
    const created = await this.prisma.attendance.create({
      data: {
        twitchId: attendance.twitchId,
        attendedAt: attendance.attendedAt,
        tier: attendance.tier,
        broadcastedAt: attendance.broadcastedAt,
      },
    });

    await this.cacheManager.del(`cache.getRecentAttendance.${attendance.twitchId}`);

    const createdAttendance = new Attendance();
    createdAttendance.twitchId = created.twitchId;
    createdAttendance.attendedAt = created.attendedAt;
    createdAttendance.tier = created.tier;
    createdAttendance.broadcastedAt = created.broadcastedAt;

    return createdAttendance;
  }

  private static convertDataModel({
    twitchId,
    attendedAt,
    tier,
    broadcastedAt,
  }: PrismaAttendance) {
    const attendance = new Attendance();
    attendance.twitchId = twitchId;
    attendance.attendedAt = attendedAt;
    attendance.tier = tier;
    attendance.broadcastedAt = broadcastedAt;

    return attendance;
  }
}
