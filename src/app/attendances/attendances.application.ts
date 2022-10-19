import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BusinessError } from 'src/util/business-error';
import * as twitch from 'src/util/twitch';

import { ViewersRepository } from 'src/app/accounts/viewers.repository';

import { AttendDto } from './dtos/attend.dto';
import { Attendance } from './entities/attendance.entity';
import { AttendancesRepository } from './repositories/attendances.repository';

@Injectable()
export class AttendancesApplication {
  constructor(
    private readonly attendancesRepository: AttendancesRepository,
    private readonly viewersRepository: ViewersRepository,
    private readonly configService: ConfigService,
  ) {}

  async attend(attendDto: AttendDto) {
    const channel = this.configService.get('TMI_CHANNEL');
    const channelId = this.configService.get('TMI_CHANNEL_ID');

    if (!channel || !channelId) {
      throw new Error('no channel or channel id');
    }

    const recent = await this.attendancesRepository.getRecentAttendance(attendDto.twitchId);
    const attendance = new Attendance({ ...attendDto });

    if (recent?.broadcastedAt === attendance.broadcastedAt) {
      return new BusinessError('already-attended');
    }

    const tier = await twitch.getSubscription(channel, channelId, attendDto.twitchId);
    if (tier) {
      attendance.tier = tier;
    }

    const viewer = await this.viewersRepository.findByTwitchIdAndUsername(
      attendDto.username,
      attendDto.twitchId,
    );
    if (!viewer) {
      return new BusinessError('viewer-not-found');
    }

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
