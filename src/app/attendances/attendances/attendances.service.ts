export class AttendancesService {
  isAttendable(recentAttendedAt: Date) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const hour = now.getHours();
    const dayCalc = hour < 10 ? -1 : 0;

    const standard = new Date(year, month, day + dayCalc, 10);

    return recentAttendedAt < standard;
  }
}
