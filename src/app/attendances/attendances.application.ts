import { Injectable } from '@nestjs/common';

import { Transactional } from 'src/libs/Transactional.decorator';
import { BusinessError } from 'src/util/business-error';

import { ViewersRepository } from 'src/app/viewers/viewers.repository';

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
  ) {}

  @Transactional()
  async attend(attendDto: AttendDto) {
    const recent = await this.attendancesRepository.getRecentAttendance(attendDto.twitchId);

    if (recent && !this.attendancesService.isAttendable(recent.attendedAt)) {
      return new BusinessError('already-attended');
    }

    const attendance = new Attendance();
    attendance.twitchId = attendDto.twitchId;
    attendance.attendedAt = attendDto.attendedAt;
    attendance.tier = attendDto.tier;

    const viewer = attendDto.username
      ? await this.viewersRepository.findByTwitchIdAndUsername(attendDto.username, attendDto.twitchId)
      : await this.viewersRepository.findOne({ twitchId: attendDto.twitchId });
    if (!viewer) {
      return new BusinessError('user-not-found');
    }

    viewer.getAttendanceReward(attendDto.tier);

    await this.viewersRepository.save(viewer);
    await this.attendancesRepository.saveAttendance(attendance);
  }
}
