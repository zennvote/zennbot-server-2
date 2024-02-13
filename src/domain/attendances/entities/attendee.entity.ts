import { BusinessError } from 'src/util/business-error';

import { Entity } from '../../types/entity';

import { Attendance } from './attendance.entity';

export type AttendeeProps = {
  twitchId: string;
  ticket: number;
  ticketPiece: number;
  tier: number;
  lastAttendance?: Attendance;
};

export class Attendee extends Entity {
  public readonly twitchId: string;
  public readonly ticket: number;
  public readonly ticketPiece: number;
  public readonly tier: number;
  public readonly lastAttendance: Attendance | null;

  constructor(props: AttendeeProps) {
    super(props.twitchId);

    this.twitchId = props.twitchId;
    this.ticket = props.ticket;
    this.ticketPiece = props.ticketPiece;
    this.tier = props.tier;
    this.lastAttendance = props.lastAttendance ?? null;
  }

  public attend(attendedAt: Date) {
    const { tier, twitchId } = this;

    const broadcastedAt = Attendance.calculateBroadcatedAt(attendedAt);
    if (this.lastAttendance?.broadcastedAt === broadcastedAt) {
      return new BusinessError('already-attended');
    }

    const attendance = new Attendance({
      twitchId, tier, attendedAt, broadcastedAt,
    });
    this.mutable.lastAttendance = attendance;
    this.mutable.ticketPiece += tier * 3;

    return attendance;
  }
}
