export type AttendanceInitializer = {
  twitchId: string;
  attendedAt: Date;
  tier?: number;
  broadcastedAt?: string;
};

export class Attendance {
  twitchId: string;

  attendedAt: Date;

  broadcastedAt: string;

  tier: number;

  constructor(intializer: AttendanceInitializer) {
    this.twitchId = intializer.twitchId;
    this.attendedAt = intializer.attendedAt;
    this.tier = intializer.tier ?? 0;
    this.broadcastedAt = intializer.broadcastedAt
      ?? Attendance.calculateBroadcatedAt(intializer.attendedAt);
  }

  private static calculateBroadcatedAt(attendedAt: Date) {
    const hour = attendedAt.getHours();
    const dayCalc = hour < 10 ? -1 : 0;

    const year = `${attendedAt.getFullYear()}`.padStart(4, '0');
    const month = `${attendedAt.getMonth()}`.padStart(2, '0');
    const day = `${attendedAt.getDate() + dayCalc}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
