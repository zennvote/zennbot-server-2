import { Factory } from 'fishery';
import { Attendance } from './attendance.entity';

type AttendanceTransientParams = {
  viewerIndex: number;
};
class AttendanceFactory extends Factory<Attendance, AttendanceTransientParams> {
  viewerIndexed(viewerIndex: number) {
    return this.transient({ viewerIndex });
  }
}

export const attendanceFactory = AttendanceFactory.define(
  ({ sequence, params, transientParams }) => new Attendance({
    twitchId: `testviewer${transientParams.viewerIndex ?? sequence}`,
    broadcastedAt: '2022-11-24',
    attendedAt: new Date(2022, 11, 24),
    tier: 1,
    ...params,
  }),
);
