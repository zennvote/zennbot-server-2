import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceDataModel } from './attendance.datamodel';

@Injectable()
export class AttendancesRepository {
  constructor(
    @InjectRepository(AttendanceDataModel) private attendanceDataModelRepository: Repository<AttendanceDataModel>,
  ) {}

  async getRecentAttendance(twitchId: string): Promise<Attendance | null> {
    const result = await this.attendanceDataModelRepository.findOne({
      where: { twitchId },
      order: { attendedAt: 'DESC' },
    });

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

    const createdAttendance = new Attendance();
    createdAttendance.twitchId = created.twitchId;
    createdAttendance.attendedAt = created.attendedAt;
    createdAttendance.tier = created.tier;

    return createdAttendance;
  }
}
