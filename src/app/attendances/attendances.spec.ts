import { AttendancesService } from './attendances.service';

describe('Attendance', () => {
  describe('isAttendable', () => {
    it('최근 출석이 오늘 이전이라면 출석이 가능하다', () => {
      const now = new Date(2022, 11, 24, 20);
      jest.useFakeTimers().setSystemTime(now);

      const result = AttendancesService.isAttendable(new Date(2022, 11, 23, 20));

      expect(result).toBeTrue();
    });

    it('최근 출석이 오늘 있었더라도 기준시 이전이라면 출석이 가능하다', () => {
      const now = new Date(2022, 11, 24, 20);
      jest.useFakeTimers().setSystemTime(now);

      const result = AttendancesService.isAttendable(new Date(2022, 11, 24, 8));

      expect(result).toBeTrue();
    });

    it('최근 출석이 오늘 기준시 이후라면 출석이 불가능하다', () => {
      const now = new Date(2022, 11, 24, 20);
      jest.useFakeTimers().setSystemTime(now);

      const result = AttendancesService.isAttendable(new Date(2022, 11, 24, 11));

      expect(result).toBeFalse();
    });

    it('최근 출석이 어제라도 현재 기준시 이전이라면 출석이 불가능하다', () => {
      const now = new Date(2022, 11, 24, 6);
      jest.useFakeTimers().setSystemTime(now);

      const result = AttendancesService.isAttendable(new Date(2022, 11, 23, 11));

      expect(result).toBeFalse();
    });
  });
});
