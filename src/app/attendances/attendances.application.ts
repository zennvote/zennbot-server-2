import { Injectable } from '@nestjs/common';

import { BusinessError } from 'src/util/business-error';
import * as twitch from 'src/util/twitch';

import { ViewersRepository } from 'src/app/viewers/viewers.repository';

import { ConfigService } from '@nestjs/config';
import { AttendancesRepository } from './repositories/attendances.repository';
import { Attendance } from './entities/attendance.entity';
import { AttendDto } from './dtos/attend.dto';

@Injectable()
export class AttendancesApplication {
  constructor(
    private readonly attendancesRepository: AttendancesRepository,
    private readonly viewersRepository: ViewersRepository,
    private readonly configService: ConfigService,
  ) {}

  async attend(attendDto: AttendDto) {
    const recent = await this.attendancesRepository.getRecentAttendance(attendDto.twitchId);
    const broadcastedAt = Attendance.calculateBroadcatedAt(attendDto.attendedAt);

    if (recent?.broadcastedAt === broadcastedAt) {
      return new BusinessError('already-attended');
    }

    const tier = await twitch.getSubscription(attendDto.twitchId) ?? 0;
    const viewer = await this.viewersRepository.findByTwitchIdAndUsername(
      attendDto.username,
      attendDto.twitchId,
    );
    if (!viewer) {
      return new BusinessError('viewer-not-found');
    }

    const attendance = new Attendance({ ...attendDto, tier });
    viewer.getAttendanceReward(attendance.tier);

    await this.viewersRepository.save(viewer);
    await this.attendancesRepository.saveAttendance(attendance);

    return attendance;
  }

  async getAttendances() {
    const attendances = await this.attendancesRepository.getAttendances();

    return attendances;
  }

  async getAttendanceOfBroadcast(broadcastedAt: string) {
    const attendances = await this.attendancesRepository.getAttendancesByBroadcastedAt(
      broadcastedAt,
    );

    return attendances;
  }
}
