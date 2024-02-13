import { Attendance } from './entities/attendance.entity';
import { Attendee } from './entities/attendee.entity';

export interface AttendanceRepository {
  getAttendee(twitchId: string, username: string): Promise<Attendee | null>;
  saveAttendance(attendance: Attendance): Promise<void>;
  saveAttendee(attendee: Attendee): Promise<void>;
}
