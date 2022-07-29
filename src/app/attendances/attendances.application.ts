import { Injectable } from '@nestjs/common';

import { BusinessError } from 'src/util/business-error';
import * as twitch from 'src/util/twitch';

import { ViewersRepository } from 'src/app/viewers/viewers.repository';

import { ConfigService } from '@nestjs/config';
import { AttendancesService } from './attendances.service';
import { AttendancesRepository } from './repositories/attendances.repository';
import { Attendance } from './entities/attendance.entity';
import { AttendDto } from './dtos/attend.dto';

@Injectable()
export class AttendancesApplication {
  constructor(
    private readonly attendancesRepository: AttendancesRepository,
    private readonly attendancesService: AttendancesService,
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

    if (recent && !AttendancesService.isAttendable(recent.attendedAt)) {
      return new BusinessError('already-attended');
    }

    const tier = await twitch.getSubscription(channel, channelId, attendDto.twitchId);
    if (!tier) {
      return new BusinessError('subscription-not-found');
    }

    const attendance = new Attendance();
    attendance.twitchId = attendDto.twitchId;
    attendance.attendedAt = attendDto.attendedAt;
    attendance.tier = tier;

    const viewer = await this.viewersRepository.findByTwitchIdAndUsername(
      attendDto.username,
      attendDto.twitchId,
    );
    if (!viewer) {
      return new BusinessError('user-not-found');
    }

    viewer.getAttendanceReward(tier);

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
