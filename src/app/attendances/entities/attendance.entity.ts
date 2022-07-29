export type AttendanceInitializer = {
  twitchId: string;
  attendedAt: Date;
  tier: number;
  broadcastedAt?: string;
};

export class Attendance {
  private _twitchId: string;

  private _attendedAt: Date;

  private _broadcastedAt: string;

  private _tier: number;

  constructor(intializer: AttendanceInitializer) {
    this._twitchId = intializer.twitchId;
    this._attendedAt = intializer.attendedAt;
    this._tier = intializer.tier;
    this._broadcastedAt = intializer.broadcastedAt
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

  get twitchId() {
    return this._twitchId;
  }

  get attendedAt() {
    return this._attendedAt;
  }

  get broadcastedAt() {
    return this._broadcastedAt;
  }

  get tier() {
    return this._tier;
  }
}
