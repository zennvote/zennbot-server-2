import { Entity } from '../types/entity';

export type AttendanceProps = {
  twitchId: string;
  attendedAt: Date;
  tier?: number;
  broadcastedAt?: string;
};

export class Attendace extends Entity {
  public readonly twitchId: string;
  public readonly attendedAt: Date;
  public readonly tier: number;
  public readonly broadcastedAt: string;

  constructor(props: AttendanceProps) {
    super(props.twitchId);

    this.twitchId = props.twitchId;
    this.attendedAt = props.attendedAt;
    this.tier = props.tier ?? 0;
    this.broadcastedAt = props.broadcastedAt
      ?? Attendace.calculateBroadcatedAt(props.attendedAt);
  }

  public static calculateBroadcatedAt(attendedAt: Date) {
    const hour = attendedAt.getHours();
    const dayCalc = hour < 10 ? -1 : 0;

    const year = `${attendedAt.getFullYear()}`.padStart(4, '0');
    const month = `${attendedAt.getMonth() + 1}`.padStart(2, '0');
    const day = `${attendedAt.getDate() + dayCalc}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
