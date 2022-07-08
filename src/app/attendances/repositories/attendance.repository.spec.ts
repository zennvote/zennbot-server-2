import { Cache, caching } from 'cache-manager';
import { createTestDbConnection } from 'src/test-utils';
import { Connection, Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceDataModel } from './attendance.datamodel';
import { AttendancesRepository } from './attendances.repository';

describe('AttendanceRepository', () => {
  let db: Connection;
  let repository: AttendancesRepository;
  let typeormRepository: Repository<AttendanceDataModel>;
  let cacheManager: Cache;

  beforeEach(async () => {
    db = await createTestDbConnection([AttendanceDataModel]);
    typeormRepository = db.getRepository(AttendanceDataModel);
    cacheManager = caching({ store: 'memory', ttl: 0 });
    repository = new AttendancesRepository(typeormRepository, cacheManager);
  });

  afterEach(async () => {
    await db.close();
    await cacheManager.reset();
  });

  it('should be defined', () => {
    expect(db).toBeDefined();
    expect(typeormRepository).toBeDefined();
    expect(cacheManager).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('getRecentAttendance', () => {
    it('해당 유저의 가장 최신 출석을 반환해야 한다', async () => {
      await typeormRepository.save([
        { id: 1, twitchId: 'testviewer1', attendedAt: new Date(2022, 3, 25), tier: 1 },
        { id: 2, twitchId: 'testviewer2', attendedAt: new Date(2022, 3, 25), tier: 1 },
        { id: 3, twitchId: 'testviewer3', attendedAt: new Date(2022, 3, 25), tier: 1 },
        { id: 4, twitchId: 'testviewer4', attendedAt: new Date(2022, 3, 25), tier: 1 },
        { id: 5, twitchId: 'testviewer1', attendedAt: new Date(2022, 3, 26), tier: 1 },
        { id: 6, twitchId: 'testviewer2', attendedAt: new Date(2022, 3, 26), tier: 1 },
        { id: 7, twitchId: 'testviewer1', attendedAt: new Date(2022, 3, 27), tier: 1 },
      ]);

      const result = await repository.getRecentAttendance('testviewer1');

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Attendance);
      expect(result).toHaveProperty('twitchId', 'testviewer1');
      expect(result).toHaveProperty('attendedAt', new Date(2022, 3, 27));
      expect(result).toHaveProperty('tier', 1);
    });

    it('출석이 없을 시 null을 반환해야 한다', async () => {
      const result = await repository.getRecentAttendance('testviewer1');

      expect(result).toBeNull();
    });

    it('출석 조회에 성공했다면 캐싱해야 한다.', async () => {
      await typeormRepository.save({ id: 1, twitchId: 'testviewer1', attendedAt: new Date(2022, 3, 25), tier: 1 });

      await repository.getRecentAttendance('testviewer1');

      const cached = await cacheManager.get('cache.getRecentAttendance.testviewer1');
      expect(cached).toMatchObject({ id: 1, twitchId: 'testviewer1', attendedAt: new Date(2022, 3, 25), tier: 1 });
    });

    it('출석 조회에 실패했다면 null string을 캐싱해야 한다.', async () => {
      await repository.getRecentAttendance('testviewer1');

      const cached = await cacheManager.get('cache.getRecentAttendance.testviewer1');
      expect(cached).toBe('null');
    });

    it('캐시되어있다면 DB를 조회하지 않고 반환해야 한다.', async () => {
      await cacheManager.set('cache.getRecentAttendance.testviewer1', {
        id: 1,
        twitchId: 'testviewer1',
        attendedAt: new Date(2022, 3, 25),
        tier: 2,
      });

      const result = await repository.getRecentAttendance('testviewer1');

      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Attendance);
      expect(result).toHaveProperty('twitchId', 'testviewer1');
      expect(result).toHaveProperty('attendedAt', new Date(2022, 3, 25));
      expect(result).toHaveProperty('tier', 2);
    });

    it('null string이 캐시되어있다면 null을 반환해야 한다', async () => {
      await cacheManager.set('cache.getRecentAttendance.testviewer1', 'null');
      await typeormRepository.save({ id: 1, twitchId: 'testviewer1', attendedAt: new Date(2022, 3, 25), tier: 1 });

      const result = await repository.getRecentAttendance('testviewer1');

      expect(result).toBeNull();
    });
  });

  describe('saveAttendance', () => {
    it('출석 정보가 저장되어야 한다', async () => {
      const attendance = new Attendance();
      attendance.twitchId = 'testviewer1';
      attendance.attendedAt = new Date(2022, 11, 24, 8, 12);
      attendance.tier = 2;

      await repository.saveAttendance(attendance);

      const actually = await typeormRepository.find({ twitchId: 'testviewer1' });
      expect(actually).toHaveLength(1);
      expect(actually[0]).toMatchObject({
        twitchId: 'testviewer1',
        attendedAt: new Date(2022, 11, 24, 8, 12),
        tier: 2,
      });
    });

    it('출석 정보를 저장할 때 캐시를 초기화해야 한다', async () => {
      const attendance = new Attendance();
      attendance.twitchId = 'testviewer1';
      attendance.attendedAt = new Date(2022, 11, 24, 8, 12);
      attendance.tier = 2;
      await cacheManager.set('cache.getRecentAttendance.testviewer1', 'null');

      await repository.saveAttendance(attendance);

      const actually = await cacheManager.get('cache.getRecentAttendance.testviewer1');
      expect(actually).toBeUndefined();
    });
  });

  describe('getAttendances', () => {
    it('출석 정보를 시간순으로 조회할 수 있어야 한다', async () => {
      const datamodels = [
        { id: 1, twitchId: 'testviewer1', attendedAt: new Date(2022, 3, 25), tier: 1 },
        { id: 2, twitchId: 'testviewer2', attendedAt: new Date(2022, 3, 26), tier: 2 },
        { id: 3, twitchId: 'testviewer1', attendedAt: new Date(2022, 3, 27), tier: 1 },
      ];
      await typeormRepository.save(datamodels);

      const result = await repository.getAttendances();

      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('twitchId', 'testviewer1');
      expect(result[0]).toHaveProperty('attendedAt', new Date(2022, 3, 27));
      expect(result[0]).toHaveProperty('tier', 1);
      expect(result[1]).toHaveProperty('attendedAt', new Date(2022, 3, 26));
      expect(result[2]).toHaveProperty('attendedAt', new Date(2022, 3, 25));
    });
  });
});
