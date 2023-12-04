import { BusinessError } from 'src/util/business-error';

import { Entity } from '../../types/entity';

import { Attendance } from './attendance.entity';

export class Attendee extends Entity {
  public readonly twitchId: string;
  public readonly lastAttendance: Attendance | null;

  constructor(props: Attendance) {
    super(props.twitchId);

    this.twitchId = props.twitchId;
    this.lastAttendance = props;
  }

  public attend(tier: number) {
    const currentBroadcatedAt = Attendance.calculateBroadcatedAt(new Date());
    if (this.lastAttendance?.broadcastedAt === currentBroadcatedAt) {
      return new BusinessError('already-attended');
    }

    const attendance = new Attendance({
      twitchId: this.twitchId,
      tier,
      attendedAt: new Date(),
      broadcastedAt: currentBroadcatedAt,
    });
    this.mutable.lastAttendance = attendance;

    return attendance;
  }
}
