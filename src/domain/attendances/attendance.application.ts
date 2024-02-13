import { Injectable } from '@nestjs/common';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import { AttendanceRepository } from './attendance.repository';

@Injectable()
export class AttendancesApplication {
  constructor(
    private readonly attendancesRepository: AttendanceRepository,
  ) {}

  async attend(twitchId: string, username: string) {
    const attendedAt = new Date();

    const attendee = await this.attendancesRepository.getAttendee(twitchId, username);
    if (!attendee) return new BusinessError('attendee-not-found');

    const attendance = attendee.attend(attendedAt);
    if (isBusinessError(attendance)) return attendance;

    await this.attendancesRepository.saveAttendance(attendance);
    await this.attendancesRepository.saveAttendee(attendee);

    return attendance;
  }
}
